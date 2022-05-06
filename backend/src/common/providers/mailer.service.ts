import { Injectable } from '@nestjs/common'
import { Logger } from 'core/providers'
import { ConfigSchema } from 'core/config.schema'

import axios from 'axios'

import { ConfigService } from 'core/providers'

@Injectable()
export class MailerService {
  private config: ConfigSchema['postman']

  constructor(private configService: ConfigService, private logger: Logger) {
    this.config = this.configService.get('postman')
  }

  sendMail = async (body: string, recipient: string): Promise<void> => {
    if (this.configService.get('environment') === 'development')
      return this.logger.log(JSON.stringify(body, null, 2))

    const mail = {
      recipient,
      from: 'CheckWho.gov.sg <donotreply@mail.postman.gov.sg>',
      subject: 'One-Time Password (OTP) for CheckWho',
      body,
    }

    try {
      await axios.post(this.config.apiUrl, mail, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      })
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(e.message)
      }
      throw new Error('Email could not be sent, please try again.')
    }
  }
}
