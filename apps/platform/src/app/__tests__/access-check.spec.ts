import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { registerTenant } from './generators/user';
import { Tenant } from '../database/entities';
import { AccessCheckService } from '../services';
import { ClsContextOptions, ClsModule, ClsService } from 'nestjs-cls';
import { UserClsStore } from '@softkit/auth';
import { AccessTokenPayload } from '../common/vo/token-payload';

describe('access check service e2e test', () => {
  let app: NestFastifyApplication;
  let db: StartedDb;
  let currentTenant: Tenant;
  let accessCheckService: AccessCheckService;
  let clsService: ClsService<UserClsStore<AccessTokenPayload>>;

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
      imports: [PlatformAppModule, ClsModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    accessCheckService = app.get<AccessCheckService>(AccessCheckService);
    clsService = app.get(ClsService);

    const { tenant } = await registerTenant(app);

    currentTenant = tenant;
  });

  afterEach(async () => {
    await app.close();
  });

  it('should return true if each permission is granted', async () => {
    const tenantId = currentTenant.id;
    let result: boolean;
    const permissions = ['platform.roles.create', 'platform.roles.update'];
    const userProfileId = currentTenant.owner.id;
    await clsService.run(new Map() as ClsContextOptions, async () => {
      clsService.set('tenantId', tenantId);
      clsService.set('userId', userProfileId);

      result = await accessCheckService.hasEach(permissions);
    });

    expect(result).toBe(true);
  });

  it('should return true if one permission is granted', async () => {
    const tenantId = currentTenant.id;
    let result: boolean;
    const permissions = 'platform.roles.create';
    const userProfileId = currentTenant.owner.id;
    await clsService.run(new Map() as ClsContextOptions, async () => {
      clsService.set('tenantId', tenantId);
      clsService.set('userId', userProfileId);

      result = await accessCheckService.hasEach(permissions);
    });

    expect(result).toBe(true);
  });
});
