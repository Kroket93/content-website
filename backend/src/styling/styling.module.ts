import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantStyling } from '../entities/tenant-styling.entity';
import { StylingService } from './styling.service';
import { StylingController } from './styling.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TenantStyling])],
  controllers: [StylingController],
  providers: [StylingService],
  exports: [StylingService],
})
export class StylingModule {}
