import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { registerTenant } from './generators/user';
import { Tenant } from '../database/entities';
import { UserTenantAccountService } from '../services';

describe('user tenant service e2e test', () => {
  let app: NestFastifyApplication;
  let db: StartedDb;
  let currentTenant: Tenant;
  let userTenantAccountService: UserTenantAccountService;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    const { PlatformAppModule } = require('../platform-app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);
    userTenantAccountService = app.get<UserTenantAccountService>(
      UserTenantAccountService,
    );

    const { tenant } = await registerTenant(app);

    currentTenant = tenant;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return true if each permission is granted', async () => {
    const tenantId = currentTenant.id;

    const userProfileId = currentTenant.owner.id;
    const permissions = [
      'platform.roles.create',
      'platform.roles.read',
      'platform.roles.update',
      'platform.roles.delete',
    ];

    const result = await userTenantAccountService.hasEachPermission(
      tenantId,
      userProfileId,
      permissions,
    );

    expect(result).toBe(true);
  });
});
