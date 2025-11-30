import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    // Clear users array before each test for isolation
    (service as any).users = [];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const user = service.create(createUserDto);

      expect(user).toBeDefined();
      expect(user.name).toBe(createUserDto.name);
      expect(user.email).toBe(createUserDto.email);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    it('should assign a unique id to each user', () => {
      const createUserDto1: CreateUserDto = {
        name: 'User 1',
        email: 'user1@example.com',
      };
      const createUserDto2: CreateUserDto = {
        name: 'User 2',
        email: 'user2@example.com',
      };

      const user1 = service.create(createUserDto1);
      const user2 = service.create(createUserDto2);

      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('findAll', () => {
    it('should return an empty array initially', () => {
      const users = service.findAll();
      expect(users).toEqual([]);
    });

    it('should return all users', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      service.create(createUserDto);
      const users = service.findAll();

      expect(users.length).toBe(1);
      expect(users[0].name).toBe(createUserDto.name);
    });
  });

  describe('findOne', () => {
    it('should return undefined for non-existent user', () => {
      const user = service.findOne('non-existent-id');
      expect(user).toBeUndefined();
    });

    it('should return a user by id', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const createdUser = service.create(createUserDto);
      const foundUser = service.findOne(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(createdUser.id);
      expect(foundUser?.name).toBe(createUserDto.name);
    });
  });
});

