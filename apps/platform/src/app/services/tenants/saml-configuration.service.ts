import { Injectable } from '@nestjs/common';
import { SAMLConfiguration } from '../../database/entities';
import { SamlConfigurationRepository } from '../../repositories';

import { BaseTenantEntityService } from '@softkit/typeorm-service';

@Injectable()
export class SamlConfigurationService extends BaseTenantEntityService<
  SAMLConfiguration,
  'id',
  SamlConfigurationRepository,
  Pick<SAMLConfiguration, 'id' | 'version'>
> {
  constructor(samlConfigurationService: SamlConfigurationRepository) {
    super(samlConfigurationService);
  }
}
