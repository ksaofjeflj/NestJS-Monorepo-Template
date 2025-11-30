import { Module } from '@nestjs/common';
import { DbModule } from '@app/db';
import { AdminSeedService } from './services/admin-seed.service';
import { Admin, AdminSchema } from './schemas/admin.schema';

@Module({
  imports: [
    // Register admin schema for MongoDB
    DbModule.forFeatureMongo([{ name: Admin.name, schema: AdminSchema }]),
  ],
  providers: [AdminSeedService],
  exports: [AdminSeedService],
})
export class AdminModule {}

