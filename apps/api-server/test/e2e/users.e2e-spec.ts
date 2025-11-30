import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { UsersModule } from '../../src/users/users.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Configuration for tests (no database required)
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        // Only import UsersModule (no database dependencies)
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Set global prefix
    app.setGlobalPrefix('api');
    
    // Apply global validation pipe (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('should create a user', () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createUserDto.name);
          expect(res.body.email).toBe(createUserDto.email);
        });
    });

    it('should return 400 if name is missing', () => {
      const createUserDto = {
        email: 'john.doe@example.com',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should return 400 if email is missing', () => {
      const createUserDto = {
        name: 'John Doe',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(400);
    });

    it('should return 400 if email is invalid', () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      return request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return an array of users', () => {
      return request(app.getHttpServer())
        .get('/api/users')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('/users/:id (GET)', () => {
    it('should return a user by id', async () => {
      // First create a user
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      const userId = createResponse.body.id;

      // Then fetch it
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.name).toBe(createUserDto.name);
          expect(res.body.email).toBe(createUserDto.email);
        });
    });

    it('should return empty object for non-existent user', () => {
      return request(app.getHttpServer())
        .get('/api/users/non-existent-id')
        .expect(200)
        .expect((res) => {
          // NestJS serializes undefined as empty object {}
          expect(res.body).toEqual({});
        });
    });
  });
});

