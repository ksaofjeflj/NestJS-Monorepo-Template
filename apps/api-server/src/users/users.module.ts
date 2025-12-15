import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from '@app/db';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { UserEntity } from './entities/user.entity';

/**
 * Users Module
 * 
 * Supports both MongoDB (Mongoose) and TypeORM databases.
 * Automatically selects the correct database implementation based on DB_TYPE.
 */
@Module({
  imports: [
    ConfigModule,
    // Register MongoDB schema (will be ignored if using TypeORM)
    DbModule.forFeatureMongo([{ name: User.name, schema: UserSchema }]),
    // Register TypeORM entity (will be ignored if using MongoDB)
    DbModule.forFeatureTypeORM([UserEntity]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

