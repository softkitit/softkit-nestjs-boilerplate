import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { bootstrapBaseWebApp } from '@softkit/bootstrap';
import { StartedDb, startPostgres } from '@softkit/test-utils';
import { DataSource } from 'typeorm';

describe('Database migration', () => {
  let app: NestFastifyApplication;
  let db: StartedDb;
  let dataSource: DataSource;

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
    }).compile();

    app = await bootstrapBaseWebApp(moduleFixture, PlatformAppModule);
    dataSource = app.get(DataSource);
  });

  afterEach(async () => {
    await app.flushLogs();
    await app.close();
  });

  describe('Migration', () => {
    it('Models and tables are the same', async () => {
      const databaseUpQueries = await dataSource.driver
        .createSchemaBuilder()
        .log();

      const countOfDifferences = databaseUpQueries.upQueries;

      // if we update an entity but do not generate and run a migration the count will be more than 0
      expect(countOfDifferences.length).toBe(0);
    });
  });
});
