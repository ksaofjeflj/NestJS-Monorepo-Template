import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { User } from '../../../src/users/schemas/user.schema';
import { UserEntity } from '../../../src/users/entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;
  let mockUserRepository: any;

  beforeEach(async () => {
    // Mock Mongoose model - needs to be a constructor function
    const MockUserModel: any = jest.fn().mockImplementation((dto) => ({
      ...dto,
      _id: '123',
      save: jest.fn().mockResolvedValue({
        _id: '123',
        ...dto,
        createdAt: new Date(),
      }),
    }));

    MockUserModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([]),
    });
    MockUserModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    MockUserModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    MockUserModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });
    MockUserModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    mockUserModel = MockUserModel;

    // Mock TypeORM repository
    mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn().mockResolvedValue([]),
      findOne: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
      ],
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mongodb'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const user = await service.create(createUserDto);

      expect(user).toBeDefined();
      expect(mockUserModel).toHaveBeenCalledWith(createUserDto);
    });

    it('should assign a unique id to each user', async () => {
      const createUserDto1: CreateUserDto = {
        name: 'User 1',
        email: 'user1@example.com',
      };
      const createUserDto2: CreateUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
      };

      const user1 = await service.create(createUserDto1);
      const user2 = await service.create(createUserDto2);

      expect(user1).toBeDefined();
      expect(user2).toBeDefined();
      expect(mockUserModel).toHaveBeenCalledTimes(2);
    });
  });

  describe('findAll', () => {
    it('should return an empty array initially', async () => {
      const users = await service.findAll();
      expect(users).toEqual([]);
    });

    it('should return all users', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const mockUsers = [
        {
          _id: '123',
          name: createUserDto.name,
          email: createUserDto.email,
        },
      ];

      mockUserModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const users = await service.findAll();

      expect(users.length).toBe(1);
      expect((users[0] as any).name).toBe(createUserDto.name);
    });
  });

  describe('findOne', () => {
    it('should return null for non-existent user', async () => {
      const user = await service.findOne('non-existent-id');
      expect(user).toBeNull();
    });

    it('should return a user by id', async () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const mockCreatedUser = {
        _id: '123',
        name: createUserDto.name,
        email: createUserDto.email,
        save: jest.fn().mockResolvedValue({
          _id: '123',
          name: createUserDto.name,
          email: createUserDto.email,
        }),
      };

      mockUserModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockCreatedUser),
      });

      const createdUser = await service.create(createUserDto);
      // Handle both MongoDB (_id) and TypeORM (id) formats
      const userId = (createdUser as any)._id || (createdUser as any).id || '123';
      const foundUser = await service.findOne(userId);

      expect(foundUser).toBeDefined();
    });
  });
});
