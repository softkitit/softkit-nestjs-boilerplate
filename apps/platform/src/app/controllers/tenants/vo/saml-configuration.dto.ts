import {
  IsBooleanLocalized,
  IsStringCombinedLocalized,
  IsUrlLocalized,
} from '@softkit/validation';
import { Expose, Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { IdpMappingDto } from '../../roles/vo/idp-mapping.dto';
import { SAMLConfiguration } from '../../../database/entities';
import { PickType } from '@nestjs/swagger';

export class SetupSamlConfiguration {
  @IsUrlLocalized()
  @Expose()
  entryPoint!: string;

  @IsStringCombinedLocalized()
  @Expose()
  certificate!: string;

  @Type(/* istanbul ignore next */ () => IdpMappingDto)
  @ValidateNested()
  @Expose()
  fieldsMapping!: IdpMappingDto;

  @IsBooleanLocalized()
  @Expose()
  enabled!: boolean;
}

export class SetupSamlConfigurationResponseDTO extends PickType(
  SAMLConfiguration,
  ['id'],
) {
  @Expose()
  message!: string;
}
