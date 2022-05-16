import { Module } from '@nestjs/common'
import { RouterModule } from '@nestjs/core'

import { HealthModule } from './health/health.module'
import { NotificationsModule } from './notifications/notifications.module'
import { OfficersModule } from './officers/officers.module'
import { AuthOfficerModule } from './auth-officer/auth-officer.module'
import { AgenciesModule } from './agencies/agencies.module'

const apiModules = [
  HealthModule,
  NotificationsModule,
  OfficersModule,
  AuthOfficerModule,
  AgenciesModule,
  NotificationsModule,
]

@Module({
  imports: [
    ...apiModules,
    RouterModule.register([
      {
        path: 'api',
        children: apiModules,
      },
    ]),
  ],
})
export class ApiModule {}