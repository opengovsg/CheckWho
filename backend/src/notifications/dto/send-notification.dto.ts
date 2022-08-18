import { IsString, IsOptional, IsNotEmpty } from 'class-validator'
import { IsNric } from '../../common/decorators'
import { Notification } from 'database/entities'
import { GetOfficerProfileDto } from '../../officers/dto'

// TODO refactor notification DTOs into shared folder 2/2
export class SendNotificationDto {
  @IsString()
  @IsOptional()
  callScope: string

  @IsString()
  @IsNric()
  @IsNotEmpty()
  nric: string
}

export type SendNotificationResponseDto = Pick<
  Notification,
  'id' | 'createdAt' | 'callScope'
> & {
  officer: GetOfficerProfileDto
}