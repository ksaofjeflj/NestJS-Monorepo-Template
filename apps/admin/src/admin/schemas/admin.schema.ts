import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminDocument = Admin & Document;

/**
 * Admin Schema (MongoDB)
 * 
 * Simple admin schema for authentication and authorization.
 * Can be easily extended with additional fields.
 */
@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string; // Should be hashed using bcrypt

  @Prop({ required: true, default: 'admin' })
  role: string; // 'admin', 'super_admin', 'moderator', etc.

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop()
  name?: string;

  @Prop()
  avatar?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

