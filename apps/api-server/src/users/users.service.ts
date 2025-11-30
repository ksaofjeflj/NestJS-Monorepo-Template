import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users: any[] = []; 
  private idCounter = 0;

  create(createUserDto: CreateUserDto) {
    const user = {
      id: `${Date.now()}-${++this.idCounter}`,
      ...createUserDto,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll() {
    return this.users;
  }

  findOne(id: string) {
    return this.users.find((user) => user.id === id);
  }
}

