import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto } from './dto';
import { Content } from '../entities/content.entity';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  private getTenantId(tenantId: string | undefined): string {
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is required');
    }
    return tenantId;
  }

  @Post()
  async create(
    @Headers('x-tenant-id') tenantId: string,
    @Body() createContentDto: CreateContentDto,
  ): Promise<Content> {
    return this.contentService.create(
      this.getTenantId(tenantId),
      createContentDto,
    );
  }

  @Get()
  async findAll(@Headers('x-tenant-id') tenantId: string): Promise<Content[]> {
    return this.contentService.findAll(this.getTenantId(tenantId));
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<Content> {
    return this.contentService.findOne(id, this.getTenantId(tenantId));
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-tenant-id') tenantId: string,
    @Body() updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    return this.contentService.update(
      id,
      this.getTenantId(tenantId),
      updateContentDto,
    );
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Headers('x-tenant-id') tenantId: string,
  ): Promise<void> {
    return this.contentService.remove(id, this.getTenantId(tenantId));
  }
}
