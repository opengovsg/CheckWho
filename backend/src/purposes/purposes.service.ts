import { BadRequestException, Injectable } from '@nestjs/common'
import { Purpose, SGNotifyTemplateParams } from '../database/entities'
import { PurposeResponseDto } from './dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class PurposesService {
  constructor(
    @InjectRepository(Purpose)
    private purposeRepository: Repository<Purpose>,
  ) {}

  async getPurposeValidityByAgencyId(
    purposeId: string,
    agencyId: string,
  ): Promise<boolean> {
    const purpose = await this.purposeRepository.findOne({
      where: { purposeId, agency: { id: agencyId } },
    })
    return !!purpose
  }

  async getPurposesByAgencyId(agencyId: string): Promise<Purpose[]> {
    return await this.purposeRepository.find({
      where: { agency: { id: agencyId } },
      relations: ['agency'],
    })
  }

  async getSGNotifyTemplateParams(
    purposeId: string,
  ): Promise<SGNotifyTemplateParams> {
    const purpose = await this.purposeRepository.findOne({
      where: { purposeId },
    })
    if (!purpose) {
      throw new BadRequestException(
        `Purpose with purposeId ${purposeId} does not exist`,
      )
    }
    return purpose.sgNotifyTemplateParams
  }

  mapToDto(purpose: Purpose): PurposeResponseDto {
    const { purposeId, menuDescription } = purpose
    return {
      purposeId,
      menuDescription,
    }
  }
}
