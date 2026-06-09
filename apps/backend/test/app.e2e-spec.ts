import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AgentZero (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/auth', () => {
    it('should respond with 404 for invalid route', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth')
        .expect(404);
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 400 for missing body', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/v1/agents', () => {
    it('should return 200 (using hardcoded userId)', () => {
      return request(app.getHttpServer())
        .get('/api/v1/agents')
        .expect(200);
    });
  });

  describe('GET /api/v1/health', () => {
    it('should return NestJS default 404', () => {
      return request(app.getHttpServer())
        .get('/api/v1/health')
        .expect(404);
    });
  });
});
