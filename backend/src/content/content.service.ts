import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Content, ContentStatus } from '../entities/content.entity';
import { CreateContentDto, UpdateContentDto } from './dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async create(
    tenantId: string,
    createContentDto: CreateContentDto,
  ): Promise<Content> {
    const content = this.contentRepository.create({
      ...createContentDto,
      tenantId,
      publishedAt:
        createContentDto.status === ContentStatus.PUBLISHED ? new Date() : null,
    });

    return this.contentRepository.save(content);
  }

  async findAll(tenantId: string): Promise<Content[]> {
    return this.contentRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, tenantId: string): Promise<Content> {
    const content = await this.contentRepository.findOne({
      where: { id, tenantId },
    });

    if (!content) {
      throw new NotFoundException(`Content with ID "${id}" not found`);
    }

    return content;
  }

  async update(
    id: string,
    tenantId: string,
    updateContentDto: UpdateContentDto,
  ): Promise<Content> {
    const content = await this.findOne(id, tenantId);

    // Set publishedAt when status changes to published
    if (
      updateContentDto.status === ContentStatus.PUBLISHED &&
      content.status !== ContentStatus.PUBLISHED
    ) {
      content.publishedAt = new Date();
    }

    Object.assign(content, updateContentDto);
    return this.contentRepository.save(content);
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const content = await this.findOne(id, tenantId);
    await this.contentRepository.remove(content);
  }
}
