import { Test, TestingModule } from '@nestjs/testing'
import { NotificationsService } from './notifications.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Agency, Notification, Officer } from '../database/entities'
import { OfficersService } from '../officers/officers.service'
import { AgenciesService } from '../agencies/agencies.service'

describe('NotificationsService', () => {
  let service: NotificationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        OfficersService,
        {
          provide: getRepositoryToken(Officer),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
        AgenciesService,
        {
          provide: getRepositoryToken(Agency),
          useValue: {
            /*TODO: ADD MOCK VALUES HERE*/
          },
        },
      ],
    }).compile()

    service = module.get<NotificationsService>(NotificationsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
