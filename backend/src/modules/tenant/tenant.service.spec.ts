import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from '../../entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { StylingService } from '../../styling/styling.service';

describe('TenantService', () => {
  let service: TenantService;
  let repository: jest.Mocked<Repository<Tenant>>;
  let cacheManager: {
    get: jest.Mock;
    set: jest.Mock;
    del: jest.Mock;
  };
  let stylingService: {
    createDefaultStyling: jest.Mock;
  };

  const mockTenant: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    slug: 'tech-blog',
    name: 'Tech Blog',
    domain: 'tech-blog.example.com',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockTenantWithoutDomain: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    slug: 'cooking-tips',
    name: 'Cooking Tips',
    domain: null,
    isActive: true,
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    stylingService = {
      createDefaultStyling: jest.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: mockRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
        {
          provide: StylingService,
          useValue: stylingService,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
    repository = module.get(getRepositoryToken(Tenant));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new tenant and default styling', async () => {
      const createTenantDto: CreateTenantDto = {
        slug: 'tech-blog',
        name: 'Tech Blog',
        domain: 'tech-blog.example.com',
      };

      repository.create.mockReturnValue(mockTenant);
      repository.save.mockResolvedValue(mockTenant);

      const result = await service.create(createTenantDto);

      expect(repository.create).toHaveBeenCalledWith(createTenantDto);
      expect(repository.save).toHaveBeenCalledWith(mockTenant);
      expect(stylingService.createDefaultStyling).toHaveBeenCalledWith(mockTenant.id);
      expect(result).toEqual(mockTenant);
    });

    it('should create a tenant without domain and with default styling', async () => {
      const createTenantDto: CreateTenantDto = {
        slug: 'cooking-tips',
        name: 'Cooking Tips',
      };

      repository.create.mockReturnValue(mockTenantWithoutDomain);
      repository.save.mockResolvedValue(mockTenantWithoutDomain);

      const result = await service.create(createTenantDto);

      expect(repository.create).toHaveBeenCalledWith(createTenantDto);
      expect(stylingService.createDefaultStyling).toHaveBeenCalledWith(mockTenantWithoutDomain.id);
      expect(result).toEqual(mockTenantWithoutDomain);
    });
  });

  describe('findAll', () => {
    it('should return all tenants ordered by createdAt DESC', async () => {
      const tenants = [mockTenantWithoutDomain, mockTenant];
      repository.find.mockResolvedValue(tenants);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(tenants);
    });

    it('should return empty array when no tenants exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return cached tenant if available', async () => {
      cacheManager.get.mockResolvedValue(mockTenant);

      const result = await service.findOne(mockTenant.id);

      expect(cacheManager.get).toHaveBeenCalledWith(`tenant:id:${mockTenant.id}`);
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should fetch from database and cache if not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(mockTenant.id);

      expect(cacheManager.get).toHaveBeenCalledWith(`tenant:id:${mockTenant.id}`);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `tenant:id:${mockTenant.id}`,
        mockTenant,
        300000,
      );
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        'Tenant with ID "non-existent-id" not found',
      );
    });
  });

  describe('findBySlug', () => {
    it('should return cached tenant if available', async () => {
      cacheManager.get.mockResolvedValue(mockTenant);

      const result = await service.findBySlug(mockTenant.slug);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
      );
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should fetch from database and cache if not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findBySlug(mockTenant.slug);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { slug: mockTenant.slug },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
        mockTenant,
        300000,
      );
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found by slug', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        'Tenant with slug "non-existent-slug" not found',
      );
    });
  });

  describe('findByDomain', () => {
    it('should return cached tenant if available', async () => {
      cacheManager.get.mockResolvedValue(mockTenant);

      const result = await service.findByDomain(mockTenant.domain!);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
      );
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(mockTenant);
    });

    it('should fetch from database and cache if not in cache', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findByDomain(mockTenant.domain!);

      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { domain: mockTenant.domain },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
        mockTenant,
        300000,
      );
      expect(result).toEqual(mockTenant);
    });

    it('should throw NotFoundException when tenant not found by domain', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.findByDomain('non-existent.example.com'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findByDomain('non-existent.example.com'),
      ).rejects.toThrow('Tenant with domain "non-existent.example.com" not found');
    });
  });

  describe('update', () => {
    it('should update tenant and invalidate cache', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Tech Blog',
      };

      const updatedTenant = { ...mockTenant, name: 'Updated Tech Blog' };

      cacheManager.get.mockResolvedValue(mockTenant);
      repository.save.mockResolvedValue(updatedTenant);

      const result = await service.update(mockTenant.id, updateTenantDto);

      expect(cacheManager.del).toHaveBeenCalledWith(`tenant:id:${mockTenant.id}`);
      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
      );
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedTenant);
    });

    it('should update tenant without domain and not try to invalidate domain cache', async () => {
      const updateTenantDto: UpdateTenantDto = {
        name: 'Updated Cooking Tips',
      };

      const updatedTenant = {
        ...mockTenantWithoutDomain,
        name: 'Updated Cooking Tips',
      };

      cacheManager.get.mockResolvedValue(mockTenantWithoutDomain);
      repository.save.mockResolvedValue(updatedTenant);

      await service.update(mockTenantWithoutDomain.id, updateTenantDto);

      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:id:${mockTenantWithoutDomain.id}`,
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:slug:${mockTenantWithoutDomain.slug}`,
      );
      expect(cacheManager.del).toHaveBeenCalledTimes(2); // No domain cache to invalidate
    });

    it('should throw NotFoundException when updating non-existent tenant', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove tenant and invalidate cache', async () => {
      cacheManager.get.mockResolvedValue(mockTenant);
      repository.remove.mockResolvedValue(mockTenant);

      await service.remove(mockTenant.id);

      expect(cacheManager.del).toHaveBeenCalledWith(`tenant:id:${mockTenant.id}`);
      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
      );
      expect(repository.remove).toHaveBeenCalledWith(mockTenant);
    });

    it('should throw NotFoundException when removing non-existent tenant', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('caching behavior', () => {
    it('should use correct cache TTL of 5 minutes (300000ms)', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockTenant);

      await service.findOne(mockTenant.id);

      expect(cacheManager.set).toHaveBeenCalledWith(
        expect.any(String),
        mockTenant,
        300000,
      );
    });

    it('should use correct cache key prefix', async () => {
      cacheManager.get.mockResolvedValue(null);
      repository.findOne.mockResolvedValue(mockTenant);

      await service.findOne(mockTenant.id);
      await service.findBySlug(mockTenant.slug);
      await service.findByDomain(mockTenant.domain!);

      expect(cacheManager.get).toHaveBeenCalledWith(`tenant:id:${mockTenant.id}`);
      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:slug:${mockTenant.slug}`,
      );
      expect(cacheManager.get).toHaveBeenCalledWith(
        `tenant:domain:${mockTenant.domain}`,
      );
    });
  });
});
