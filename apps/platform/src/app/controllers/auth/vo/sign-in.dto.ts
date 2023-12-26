import { PickType } from '@nestjs/swagger';
import { UserProfile } from '../../../database/entities';
import { Expose } from 'class-transformer';

export class SignInRequest extends PickType(UserProfile, [
  'email',
  'password',
]) {}

export class SignInResponse {
  @Expose()
  accessToken!: string;

  @Expose()
  refreshToken!: string;
}

export class SignInResponseDTO extends SignInResponse {
  @Expose()
  message!: string;
}
