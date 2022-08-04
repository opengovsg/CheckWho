import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator'

export class GetOtpReqDto {
  // TODO (maybe): refactor into common email property
  @IsEmail() // in theory can make is specific to gov.sg email
  email: string
}

export class VerifyOtpReqDto {
  @MinLength(6)
  @MaxLength(6)
  @IsString()
  otp: string

  // TODO (maybe): refactor into common email property
  @IsEmail() // in theory can make is specific to gov.sg email
  @IsString()
  email: string
}
