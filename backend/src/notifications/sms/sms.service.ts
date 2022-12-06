import { BadGatewayException, Injectable } from '@nestjs/common'
import twilio from 'twilio'

import { MessageStatus } from 'twilio/lib/rest/api/v2010/account/message'

import { ConfigSchema } from '../../core/config.schema'
import { ConfigService, Logger } from '../../core/providers'
import {
  GOGOVSG_ENDPOINT_ERROR_MESSAGE,
  TWILIO_ENDPOINT_ERROR_MESSAGE,
} from '../constants'
import { GoGovSGService } from '../gogovsg/gogovsg.service'
import {
  AgencyParams,
  OfficerParams,
} from '../sgnotify/message-templates/sgnotify-utils'

import { SmsMessageTemplateParams } from '~shared/types/api'

export interface SMSParams {
  senderId: string
  senderPhoneNumber: string
  recipientPhoneNumber: string
  message: string
  status: MessageStatus | null
  sid: string | null // string identifier returned by Twilio
  errorCode: number | null
  errorMessage: string | null
  numSegments: string | null
}

export const supportedAgencies = ['OGP', 'MOM', 'MOH']

@Injectable()
export class SMSService {
  private readonly config: ConfigSchema['twilio']

  constructor(
    private configService: ConfigService,
    private logger: Logger,
    private gogovsgService: GoGovSGService,
  ) {
    this.config = this.configService.get('twilio')
  }

  async sendSMS(
    officerAgency: string,
    smsParams: SMSParams,
  ): Promise<SMSParams> {
    const { accountSid, authToken } =
      this.getAgencyAccountSidAndAuthToken(officerAgency)
    const client = twilio(accountSid, authToken)

    const messageInstance = await client.messages
      .create({
        body: smsParams.message,
        from: smsParams.senderId ?? smsParams.senderPhoneNumber,
        to: `+65${smsParams.recipientPhoneNumber}`, // need to convert to E.164 format
      })
      .catch((err) => {
        this.logger.error(JSON.stringify(err))
        throw new BadGatewayException(TWILIO_ENDPOINT_ERROR_MESSAGE)
      })
    const { status, sid, errorCode, errorMessage, numSegments } =
      messageInstance
    return {
      ...smsParams,
      status,
      sid,
      errorCode,
      errorMessage,
      numSegments,
    }
  }

  async generateSMSParamsByTemplate(
    recipientPhoneNumber: string,
    agencyParams: Omit<AgencyParams, 'agencyLogoUrl'>, // no need in SMS
    officerParams: OfficerParams,
    params: SmsMessageTemplateParams,
    uniqueParamString: string,
  ): Promise<SMSParams> {
    const { agencyShortName, agencyName } = agencyParams
    const { officerName, officerPosition } = officerParams
    const { message } = params

    const { senderId, phoneNumber: senderPhoneNumber } =
      this.getAgencySenderIdAndPhoneNumber(agencyShortName)

    const checkerUrl = `check.go.gov.sg/sms/${uniqueParamString}`
    const shortUrl = `check-sms-${uniqueParamString}` // to pass to Go API
    const shortUrlRes = await this.gogovsgService
      .createShortLink(checkerUrl, shortUrl)
      .catch((err) => {
        this.logger.error(JSON.stringify(err))
        // 1. currently, for reasons I don't understand, this error message is not shown on the frontend but still logged on the backend
        // 2. for future extension, we can consider just using check.go.gov.sg URL directly instead of shortening it to avoid additional API call
        throw new BadGatewayException(GOGOVSG_ENDPOINT_ERROR_MESSAGE)
      })
    // included in SMS
    const embeddedUrl =
      this.configService.get('environment') === 'production'
        ? `go.gov.sg/${shortUrlRes}`
        : `staging.go.gov.sg/${shortUrlRes}`

    return {
      senderId,
      senderPhoneNumber,
      recipientPhoneNumber,
      // hardcode for now, in theory should support variable number of params
      message: message
        .replace('{{officerName}}', officerName)
        .replace('{{officerPosition}}', officerPosition)
        .replace('{{agencyName}}', agencyName)
        .replace('{{uniqueUrl}}', embeddedUrl),
      status: null,
      sid: null,
      errorCode: null,
      errorMessage: null,
      numSegments: null,
    }
  }

  getAgencySenderIdAndPhoneNumber = (
    officerAgency: string,
  ): { senderId: string; phoneNumber: string } => {
    switch (officerAgency) {
      case 'OGP':
        return {
          senderId: this.config.ogpCredentials.senderId,
          phoneNumber: this.config.ogpCredentials.phoneNumber,
        }
      case 'MOH':
        return {
          senderId: this.config.mohCredentials.senderId,
          phoneNumber: this.config.mohCredentials.phoneNumber,
        }
      case 'MOM':
        return {
          senderId: this.config.momCredentials.senderId,
          phoneNumber: this.config.momCredentials.phoneNumber,
        }
      default:
        return {
          senderId: this.config.defaultCredentials.senderId,
          phoneNumber: this.config.defaultCredentials.phoneNumber,
        }
    }
  }

  getAgencyAccountSidAndAuthToken = (
    officerAgency: string,
  ): { accountSid: string; authToken: string } => {
    switch (officerAgency) {
      case 'OGP':
        return {
          accountSid: this.config.ogpCredentials.accountSid,
          authToken: this.config.ogpCredentials.authToken,
        }
      case 'MOH':
        return {
          accountSid: this.config.mohCredentials.accountSid,
          authToken: this.config.mohCredentials.authToken,
        }
      case 'MOM':
        return {
          accountSid: this.config.momCredentials.accountSid,
          authToken: this.config.momCredentials.authToken,
        }
      default:
        return {
          accountSid: this.config.defaultCredentials.accountSid,
          authToken: this.config.defaultCredentials.authToken,
        }
    }
  }
}
