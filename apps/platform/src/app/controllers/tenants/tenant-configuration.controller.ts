import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { I18nService } from '@softkit/i18n';
import { SamlConfigurationService, TenantService } from '../../services';

import {
  SetupSamlConfiguration,
  SetupSamlConfigurationResponseDTO,
} from './vo/saml-configuration.dto';
import { I18nTranslations } from '../../generated/i18n.generated';
import { map } from '@softkit/validation';

@ApiTags('Tenants')
@Controller({
  path: 'tenants/configuration',
  version: '1',
})
export class TenantsConfigurationController {
  constructor(
    private readonly i18: I18nService<I18nTranslations>,
    private readonly tenantsService: TenantService,
    private readonly samlConfigurationService: SamlConfigurationService,
  ) {}

  @Post('saml')
  @HttpCode(HttpStatus.OK)
  public async setupSaml(
    @Body() request: SetupSamlConfiguration,
  ): Promise<SetupSamlConfigurationResponseDTO> {
    return this.samlConfigurationService
      .createOrUpdateEntity(request)
      .then((result) => {
        const responseDTO = map(result, SetupSamlConfigurationResponseDTO);
        return {
          ...responseDTO,
          message: this.i18.t('tenant.SAML_CONFIGURATION_FINISHED'),
        };
      });
  }
}
