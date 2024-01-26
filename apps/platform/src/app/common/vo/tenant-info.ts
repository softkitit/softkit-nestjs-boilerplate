import { TenantInfo as DefaultTenantInfo } from '@softkit/auth';
import { RoleType } from '../../database/entities/roles/types/default-role.enum';

export interface TenantInfo extends DefaultTenantInfo<RoleType> {}
