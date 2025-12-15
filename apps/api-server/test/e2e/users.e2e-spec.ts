import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { UsersModule } from '../../src/users/users.module';
import { User } from '../../src/users/schemas/user.schema';
import { UserEntity } from '../../src/users/entities/user.entity';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let mockUserModel: any;
  let mockUserRepository: any;

  beforeAll(async () => {
    // Mock Mongoose model
    mockUserModel = {
      create: jest.fn().mockImplementation((dto) => {
        const user = {
          ...dto,
          _id: '123',
          save: jest.fn().mockResolvedValue({
            _id: '123',
            id: '123',
            ...dto,
            createdAt: new Date(),
            toObject: jest.fn().mockReturnValue({
              _id: '123',
              id: '123',
              ...dto,
              createdAt: new Date(),
            }),
          }),
        };
        return user;
      }),
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
      findOne: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    };

    // Mock TypeORM repository
    mockUserRepository = {
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) => ({
        id: '123',
        ...entity,
        createdAt: new Date(),
      })),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Configuration for tests
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: ['.env.test', '.env'],
        }),
        // Import UsersModule with mocked dependencies
        UsersModule.forRoot(),
      ],
    })
      .overrideProvider(getModelToken(User.name))
      .useValue(mockUserModel)
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUserRepository)
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'database.type') return 'mongodb';
          return undefined;
        }),
      })
      .compile();

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
    it('should create a user', async () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      // Setup mock to return saved user
      const savedUser = {
        _id: '123',
        id: '123',
        ...createUserDto,
        createdAt: new Date(),
      };

      mockUserModel.create.mockReturnValueOnce({
        ...createUserDto,
        _id: '123',
        save: jest.fn().mockResolvedValue(savedUser),
      });

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

      return request(app.getHttpServer()).post('/api/users').send(createUserDto).expect(400);
    });

    it('should return 400 if email is missing', () => {
      const createUserDto = {
        name: 'John Doe',
      };

      return request(app.getHttpServer()).post('/api/users').send(createUserDto).expect(400);
    });

    it('should return 400 if email is invalid', () => {
      const createUserDto = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      return request(app.getHttpServer()).post('/api/users').send(createUserDto).expect(400);
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

      // Setup mock for create
      const savedUser = {
        _id: '123',
        id: '123',
        ...createUserDto,
        createdAt: new Date(),
      };

      mockUserModel.create.mockReturnValueOnce({
        ...createUserDto,
        _id: '123',
        save: jest.fn().mockResolvedValue(savedUser),
      });

      // Setup mock for findById
      mockUserModel.findById.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(savedUser),
      });

      const createResponse = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      const userId = createResponse.body.id || createResponse.body._id || '123';

      // Then fetch it
      return request(app.getHttpServer())
        .get(`/api/users/${userId}`)
        .expect(200)
        .expect((res) => {
          const id = res.body.id || res.body._id;
          expect(id).toBe(userId);
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
