import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { MessageTemplate, Notification, UniqueParam } from 'database/entities'
import { OfficersModule } from 'officers/officers.module'

import { MessageTemplatesService } from '../message-templates/message-templates.service'

import { GoGovSGService } from './gogovsg/gogovsg.service'
import { SGNotifyService } from './sgnotify/sgnotify.service'
import { SMSService } from './sms/sms.service'
import { UniqueParamService } from './unique-params/unique-param.service'
import { NotificationsController } from './notifications.controller'
import {
  SGNotifyNotificationsService,
  SMSNotificationService,
} from './notifications.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageTemplate, Notification, UniqueParam]),
    OfficersModule,
  ],
  controllers: [NotificationsController],
  providers: [
    SMSNotificationService,
    SGNotifyNotificationsService,
    GoGovSGService,
    MessageTemplatesService,
    SGNotifyService,
    SMSService,
    UniqueParamService,
  ],
})
export class NotificationsModule {
  constructor(private sgNotifyService: SGNotifyService) {}

  async onModuleInit(): Promise<void> {
    await this.sgNotifyService.initialize()
  }
}
