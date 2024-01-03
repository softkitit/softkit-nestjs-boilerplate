import { faker } from '@faker-js/faker';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { SignUpByEmailWithTenantCreationRequest } from '../controllers/auth/vo/sign-up.dto';
import {
  ExternalApprovalService,
  TenantService,
  UserService,
} from '../services';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { ApproveSignUpRequest } from '../controllers/auth/vo/approve.dto';
import { AbstractSignupService } from '../services/auth/signup/signup.service.interface';
import { TenantSignupService } from '../services/auth/signup/tenant-signup.service';
import { successSignupDto } from './generators/signup';
import { registerTenant } from './generators/user';
import { UserProfileStatus } from '../database/entities/users/types/user-profile-status.enum';

const signUpDto: SignUpByEmailWithTenantCreationRequest = successSignupDto();

describe('tenant auth e2e test', () => {
  let app: NestFastifyApplication;
  let approvalService: ExternalApprovalService;
  let tenantService: TenantService;
  let userService: UserService;
  let db: StartedDb;

  beforeAll(async () => {
    db = await startPostgres({
      runMigrations: true,
    });
  }, 60_000);

  afterAll(async () => {
    await db.container.stop();
  });

  beforeEach(async () => {
    signUpDto.email = faker.internet.email({
      provider: 'gmail' + faker.string.alphanumeric(10).toString() + '.com',
    });

    const { PlatformAppModule } = require('../platform-app.module');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlatformAppModule],
    })
      .overrideProvider(AbstractSignupService)
      .useClass(TenantSignupService)
      .compile();
    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);

    approvalService = app.get(ExternalApprovalService);
    userService = app.get(UserService);
    tenantService = app.get(TenantService);
  });

  afterEach(async () => {
    await app.close();
    await app.flushLogs();
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('should successful signup', async () => {
      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signUpDto,
      });

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body).message).toBeDefined();

      const tenant = await tenantService.findOne({
        where: {
          tenantFriendlyIdentifier: signUpDto.companyIdentifier,
        },
      });

      expect(tenant).toBeDefined();
    });
  });

  describe('sign in', () => {
    it('successful sign in', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signUpDto,
      });

      expect(signUpResponse.statusCode).toBe(201);

      const approvals = await approvalService.findAll();
      expect(approvals.length).toBe(1);

      const approvalObject = approvals[0];

      await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/approve-signup',
        payload: {
          id: approvalObject.id,
          code: approvalObject.code,
        } as ApproveSignUpRequest,
      });

      const response = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/signin',
        payload: {
          email: signUpDto.email,
          password: signUpDto.password,
        },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toBeDefined();
      expect(body.accessToken).toBeDefined();
      expect(body.refreshToken).toBeDefined();

      expect(body.accessToken).not.toBe(body.refreshToken);
    });

    describe('refresh access token', () => {
      it('successful refresh-access-token', async () => {
        const { userRefreshToken } = await registerTenant(app);

        const response = await app.inject({
          method: 'POST',
          url: 'api/platform/v1/auth/refresh-access-token',
          headers: {
            Authorization: `Bearer ${userRefreshToken}`,
          },
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body.accessToken).toBeDefined();
      });

      it('unsuccessful refresh-access-token', async () => {
        const { userRefreshToken, userEmail, tenant } =
          await registerTenant(app);

        const user = await userService.findOneByEmail(userEmail, tenant.id);
        await userService.createOrUpdateEntity({
          ...user,
          status: UserProfileStatus.DEACTIVATED,
        });

        const response = await app.inject({
          method: 'POST',
          url: 'api/platform/v1/auth/refresh-access-token',
          headers: {
            Authorization: `Bearer ${userRefreshToken}`,
          },
        });

        expect(response.statusCode).toBe(401);
      });
    });

    it('should not register second user because it is already exists', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signUpDto,
      });

      expect(signUpResponse.statusCode).toBe(201);

      const secondSignUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signUpDto,
      });

      expect(secondSignUpResponse.statusCode).toBe(409);
    });

    it('should not register user because this tenant identifier already exists', async () => {
      const signUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: signUpDto,
      });

      expect(signUpResponse.statusCode).toBe(201);

      const secondSignUpDto = successSignupDto();

      const secondSignUpResponse = await app.inject({
        method: 'POST',
        url: 'api/platform/v1/auth/tenant-signup',
        payload: {
          ...secondSignUpDto,
          companyIdentifier: signUpDto.companyIdentifier,
        },
      });

      expect(secondSignUpResponse.statusCode).toBe(409);
    });
  });
});
