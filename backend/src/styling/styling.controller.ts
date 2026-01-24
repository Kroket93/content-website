import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  BadRequestException,
  Header,
} from '@nestjs/common';
import { StylingService } from './styling.service';
import { CreateStylingDto } from './dto';
import { TenantStyling } from '../entities/tenant-styling.entity';

@Controller('api/styling')
export class StylingController {
  constructor(private readonly stylingService: StylingService) {}

  private getTenantId(tenantId: string | undefined): string {
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is required');
    }
    return tenantId;
  }

  @Post()
  async createOrUpdate(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createStylingDto: CreateStylingDto,
  ): Promise<TenantStyling> {
    return this.stylingService.createOrUpdate(
      this.getTenantId(tenantId),
      createStylingDto,
    );
  }

  @Get()
  async findOne(
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<TenantStyling> {
    return this.stylingService.findByTenantId(this.getTenantId(tenantId));
  }

  @Get('css')
  @Header('Content-Type', 'text/css')
  async getCss(@Headers('x-tenant-id') tenantId: string): Promise<string> {
    const styling = await this.stylingService.findByTenantId(
      this.getTenantId(tenantId),
    );
    return this.stylingService.generateCssVariables(styling);
  }
}
