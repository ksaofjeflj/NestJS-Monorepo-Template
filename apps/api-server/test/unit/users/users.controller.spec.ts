import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../../src/users/users.controller';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', () => {
      const createUserDto: CreateUserDto = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      };

      const expectedUser = {
        id: '1',
        ...createUserDto,
        createdAt: new Date(),
      };

      mockUsersService.create.mockReturnValue(expectedUser);

      const result = controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const expectedUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          createdAt: new Date(),
        },
      ];

      mockUsersService.findAll.mockReturnValue(expectedUsers);

      const result = controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', () => {
      const userId = '1';
      const expectedUser = {
        id: userId,
        name: 'John Doe',
        email: 'john.doe@example.com',
        createdAt: new Date(),
      };

      mockUsersService.findOne.mockReturnValue(expectedUser);

      const result = controller.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(service.findOne).toHaveBeenCalledWith(userId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should return undefined for non-existent user', () => {
      const userId = 'non-existent';
      mockUsersService.findOne.mockReturnValue(undefined);

      const result = controller.findOne(userId);

      expect(result).toBeUndefined();
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });
});

