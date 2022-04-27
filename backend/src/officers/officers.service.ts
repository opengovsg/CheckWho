import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { Officer } from '../database/entities'
import { InjectRepository } from '@nestjs/typeorm'
import {
  OfficerDto,
  UpdateOfficerProfileDto,
  GetOfficerProfileDto,
} from './dto'

import { AgenciesService } from 'agencies/agencies.service'
import { normalizeEmail } from '../common/utils'

@Injectable()
export class OfficersService {
  constructor(
    @InjectRepository(Officer) private officerRepository: Repository<Officer>,
    private agencyService: AgenciesService,
  ) {}

  async findOrInsert(officer: OfficerDto): Promise<Officer> {
    const email = normalizeEmail(officer.email)
    const foundOfficer = await this.findByEmail(email)

    if (foundOfficer) return foundOfficer
    return await this.createOfficer(officer)
  }

  async createOfficer(officer: OfficerDto): Promise<Officer> {
    const agency = await this.agencyService.findByEmail(officer.email)
    if (!agency) throw new Error(`No agency for ${officer.email} found`)

    const officerToAdd = this.officerRepository.create({ ...officer, agency })
    return this.officerRepository.save(officerToAdd)
  }

  async findById(id: number): Promise<Officer | undefined> {
    return this.officerRepository.findOne(id, {
      relations: ['agency'],
    })
  }

  async findByEmail(email: string): Promise<Officer | undefined> {
    email = normalizeEmail(email)
    return this.officerRepository.findOne({
      where: { email },
      relations: ['agency'],
    })
  }

  async updateOfficer(
    id: number,
    officerDetails: UpdateOfficerProfileDto,
  ): Promise<void> {
    const officerToUpdate = await this.officerRepository.findOne(id)
    if (!officerToUpdate) {
      throw new Error(`Officer ${id} not found`)
    }
    await this.officerRepository.update({ id }, officerDetails)
  }

  mapToDto(officer: Officer): GetOfficerProfileDto {
    const { id, name, position, agency } = officer
    return {
      id,
      name,
      position,
      agency: this.agencyService.mapToDto(agency),
    }
  }
}
