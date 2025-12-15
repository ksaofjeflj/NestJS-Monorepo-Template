import { Injectable, NotFoundException, ConflictException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from './schemas/user.schema';
import { UserEntity } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

/**
 * Users Service
 * 
 * Handles user CRUD operations with database persistence.
 * Supports both MongoDB (Mongoose) and TypeORM (PostgreSQL/MySQL).
 */
@Injectable()
export class UsersService {
  private readonly dbType: string;

  constructor(
    @Optional() @InjectModel(User.name) private readonly userModel?: Model<User>,
    @Optional() @InjectRepository(UserEntity) private readonly userRepository?: Repository<UserEntity>,
    @Optional() private readonly configService?: ConfigService,
  ) {
    this.dbType = this.configService?.get<string>('database.type') || 'mongodb';
  }

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto, password?: string): Promise<User | UserEntity> {
    // Check if user already exists
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const userData: any = {
      name: createUserDto.name,
      email: createUserDto.email,
    };

    // Hash password if provided
    if (password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(password, saltRounds);
    }

    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      const user = new this.userModel(userData);
      return user.save();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      const user = this.userRepository.create(userData);
      // TypeORM save() returns single entity when saving one entity
      const savedUser = await this.userRepository.save(user);
      // Handle potential array return (shouldn't happen with single entity, but TypeScript needs this)
      return (Array.isArray(savedUser) ? savedUser[0] : savedUser) as UserEntity;
    }
  }

  /**
   * Find all users
   */
  async findAll(): Promise<(User | UserEntity)[]> {
    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      return this.userModel.find().exec();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      return this.userRepository.find();
    }
  }

  /**
   * Find user by ID
   */
  async findOne(id: string): Promise<User | UserEntity | null> {
    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      return this.userModel.findById(id).exec();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      return this.userRepository.findOne({ where: { id } });
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | UserEntity | null> {
    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      return this.userModel.findOne({ email }).exec();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      return this.userRepository.findOne({ where: { email } });
    }
  }

  /**
   * Update user
   */
  async update(id: string, updateData: Partial<CreateUserDto>): Promise<User | UserEntity> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      return this.userModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      await this.userRepository.update(id, updateData);
      const updatedUser = await this.userRepository.findOne({ where: { id } });
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return updatedUser;
    }
  }

  /**
   * Delete user
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (this.dbType === 'mongodb') {
      if (!this.userModel) {
        throw new Error('MongoDB user model not available');
      }
      await this.userModel.findByIdAndDelete(id).exec();
    } else {
      if (!this.userRepository) {
        throw new Error('TypeORM user repository not available');
      }
      await this.userRepository.delete(id);
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(user: User | UserEntity, password: string): Promise<boolean> {
    if (!user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }
}
