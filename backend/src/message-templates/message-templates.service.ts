import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { MessageTemplate } from '../database/entities'

import {
  MessageTemplateDto,
  MessageTemplateResDto,
  SGNotifyMessageTemplateParams,
} from '~shared/types/api'

@Injectable()
export class MessageTemplatesService {
  constructor(
    @InjectRepository(MessageTemplate)
    private messageTemplateRepository: Repository<MessageTemplate>,
  ) {}

  async isMessageTemplateValidByAgencyId(
    key: string,
    agencyId: string,
  ): Promise<boolean> {
    const messageTemplate = await this.messageTemplateRepository.findOne({
      where: { key, agency: { id: agencyId } },
    })
    return !!messageTemplate
  }

  async getMessageTemplatesByAgencyId(
    agencyId: string,
  ): Promise<MessageTemplateDto[]> {
    const messageTemplates = await this.messageTemplateRepository.find({
      where: { agency: { id: agencyId } },
      relations: ['agency'],
    })
    return messageTemplates.map(this.mapToDto)
  }

  async getSGNotifyMessageTemplateParams(key: string): Promise<{
    id: number
    sgNotifyMessageTemplateParams: SGNotifyMessageTemplateParams
  }> {
    const messageTemplate = await this.messageTemplateRepository.findOne({
      where: { key },
    })
    if (!messageTemplate) {
      throw new BadRequestException(
        `MessageTemplate with key ${key} does not exist`,
      )
    }
    const { id, sgNotifyMessageTemplateParams } = messageTemplate
    return {
      id,
      sgNotifyMessageTemplateParams,
    }
  }

  mapToDto(messageTemplate: MessageTemplate): MessageTemplateDto {
    const { key, menu, sgNotifyMessageTemplateParams } = messageTemplate
    return {
      key,
      menu,
      sgNotifyMessageTemplateParams,
    }
  }
  mapToResDto(messageTemplate: MessageTemplate): MessageTemplateResDto {
    const { key, menu } = messageTemplate
    return {
      key,
      menu,
    }
  }
}