import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ContentService } from './content.service';
import { Content, ContentStatus } from '../entities/content.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';

describe('ContentService', () => {
  let service: ContentService;
  let repository: Repository<Content>;

  const mockTenantId = 'tenant-uuid-123';

  const mockContent: Content = {
    id: 'content-uuid-123',
    tenantId: mockTenantId,
    tenant: null as any,
    title: 'Test Title',
    body: 'Test body content',
    excerpt: 'Test excerpt',
    featuredImage: null,
    tags: ['tag1', 'tag2'],
    status: ContentStatus.DRAFT,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(Content),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    repository = module.get<Repository<Content>>(getRepositoryToken(Content));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create content with draft status', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Title',
        body: 'Test body content',
        excerpt: 'Test excerpt',
        tags: ['tag1', 'tag2'],
      };

      mockRepository.create.mockReturnValue(mockContent);
      mockRepository.save.mockResolvedValue(mockContent);

      const result = await service.create(mockTenantId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createDto,
        tenantId: mockTenantId,
        publishedAt: null,
      });
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockContent);
    });

    it('should set publishedAt when status is published', async () => {
      const createDto: CreateContentDto = {
        title: 'Test Title',
        body: 'Test body content',
        status: ContentStatus.PUBLISHED,
      };

      const publishedContent = {
        ...mockContent,
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(publishedContent);
      mockRepository.save.mockResolvedValue(publishedContent);

      await service.create(mockTenantId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: mockTenantId,
          publishedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all content for a tenant', async () => {
      const contentList = [mockContent];
      mockRepository.find.mockResolvedValue(contentList);

      const result = await service.findAll(mockTenantId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { tenantId: mockTenantId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(contentList);
    });

    it('should return empty array when no content exists', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll(mockTenantId);

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return content by id and tenantId', async () => {
      mockRepository.findOne.mockResolvedValue(mockContent);

      const result = await service.findOne(mockContent.id, mockTenantId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockContent.id, tenantId: mockTenantId },
      });
      expect(result).toEqual(mockContent);
    });

    it('should throw NotFoundException when content not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('non-existent-id', mockTenantId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update content', async () => {
      const updateDto: UpdateContentDto = {
        title: 'Updated Title',
      };

      const updatedContent = { ...mockContent, title: 'Updated Title' };

      mockRepository.findOne.mockResolvedValue(mockContent);
      mockRepository.save.mockResolvedValue(updatedContent);

      const result = await service.update(
        mockContent.id,
        mockTenantId,
        updateDto,
      );

      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Title');
    });

    it('should set publishedAt when changing status to published', async () => {
      const draftContent = { ...mockContent, status: ContentStatus.DRAFT };
      const updateDto: UpdateContentDto = {
        status: ContentStatus.PUBLISHED,
      };

      mockRepository.findOne.mockResolvedValue(draftContent);
      mockRepository.save.mockResolvedValue({
        ...draftContent,
        ...updateDto,
        publishedAt: new Date(),
      });

      const result = await service.update(
        mockContent.id,
        mockTenantId,
        updateDto,
      );

      expect(result.publishedAt).toBeDefined();
    });

    it('should throw NotFoundException when content not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', mockTenantId, { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove content', async () => {
      mockRepository.findOne.mockResolvedValue(mockContent);
      mockRepository.remove.mockResolvedValue(mockContent);

      await service.remove(mockContent.id, mockTenantId);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockContent);
    });

    it('should throw NotFoundException when content not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.remove('non-existent-id', mockTenantId),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
