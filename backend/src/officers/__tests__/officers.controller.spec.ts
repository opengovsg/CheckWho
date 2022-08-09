import { createMock } from '@golevelup/ts-jest'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { AgenciesService } from 'agencies/agencies.service'

import { AuthOfficerGuard } from '../../auth-officer/guards/auth-officer.guard'
import { OfficersController } from '../officers.controller'
import { OfficersService } from '../officers.service'

const mockOfficer = {
  id: 1,
  email: 'benjamin_tan@spf.gov.sg',
  name: 'Benjamin Tan',
  position: 'Commissioner of Police',
}

describe('OfficersController', () => {
  let controller: OfficersController
  const mockAuthOfficerGuard = createMock<AuthOfficerGuard>()
  const mockOfficersService = {
    findById: jest.fn((id) => {
      if (id === mockOfficer.id) return Promise.resolve(mockOfficer)
      else throw new NotFoundException('Officer not found')
    }),
    mapToDto: jest.fn((officer) => {
      // strictly speaking, this is wrong, but OK for mocking controller (unsure)
      // in fact, mapToDto should be refactored out from service (since it's a static method) TODO
      if (officer === mockOfficer) return mockOfficer
    }),
    updateOfficer: jest.fn((id, _) => {
      if (id === mockOfficer.id) return Promise.resolve()
      else throw new Error(`Officer ${id} not found`)
    }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OfficersController],
      providers: [
        { provide: OfficersService, useValue: mockOfficersService },
        { provide: AgenciesService, useValue: {} },
      ],
    })
      .overrideGuard(AuthOfficerGuard)
      .useValue(mockAuthOfficerGuard)
      .compile()

    controller = module.get<OfficersController>(OfficersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should get officer by id', async () => {
    const officer = await controller.getOfficer(mockOfficer.id)
    expect(mockOfficersService.findById).toHaveBeenCalledWith(mockOfficer.id)
    expect(officer).toEqual(mockOfficer)
  })

  it('should throw NotFoundException', async () => {
    await expect(controller.getOfficer(123456)).rejects.toThrow(
      NotFoundException,
    )
    expect(mockOfficersService.findById).toHaveBeenCalledWith(123456)
  })

  test('updateOfficer happy path', async () => {
    await controller.updateOfficer(mockOfficer.id, {
      name: mockOfficer.name,
      position: mockOfficer.position,
    })
    expect(mockOfficersService.updateOfficer).toHaveBeenCalledWith(
      mockOfficer.id,
      {
        name: mockOfficer.name,
        position: mockOfficer.position,
      },
    )
    expect(mockOfficersService.mapToDto).toHaveBeenCalledWith(mockOfficer)
  })

  test('updateOfficer unhappy path', async () => {
    await expect(
      controller.updateOfficer(123456, {
        name: mockOfficer.name,
        position: mockOfficer.position,
      }),
    ).rejects.toThrow(BadRequestException)
  })
})