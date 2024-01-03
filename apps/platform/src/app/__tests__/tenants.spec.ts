import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { HttpStatus } from '@nestjs/common';
import { registerTenant } from './generators/user';
import { Tenant } from '../database/entities';
import { AuthConfig } from '@softkit/auth';

describe('tenants configuration e2e test', () => {
  let app: NestFastifyApplication;
  let accessToken: string;
  let db: StartedDb;
  let currentTenant: Tenant;
  let authConfig: AuthConfig;

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
    authConfig = app.get<AuthConfig>(AuthConfig);

    const { tenant, adminAccessToken } = await registerTenant(app);

    accessToken = adminAccessToken;
    currentTenant = tenant;
  });

  afterEach(async () => {
    await app.close();
  });

  describe('SAML Configuration', () => {
    it('should set up SAML configuration successfully', async () => {
      const setupSamlConfigDto = {
        entryPoint: 'https://example.com/saml/entrypoint',
        certificate: 'base64-certificate',
        fieldsMapping: {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          role: 'User',
        },
        enabled: true,
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/platform/v1/tenants/configuration/saml',
        payload: setupSamlConfigDto,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          [authConfig.headerTenantId]: currentTenant.id,
        },
      });

      expect(response.statusCode).toBe(HttpStatus.OK);

      const responseBody = JSON.parse(response.body);

      expect(responseBody.message).toBeDefined();
      expect(responseBody.id).toBeDefined();
    });
  });
});
