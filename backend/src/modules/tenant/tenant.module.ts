import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Tenant } from '../../entities/tenant.entity';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { StylingModule } from '../../styling/styling.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant]),
    CacheModule.register({
      ttl: 300000, // 5 minutes default TTL
      max: 100, // Maximum number of items in cache
    }),
    forwardRef(() => StylingModule),
  ],
  controllers: [TenantController],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}
