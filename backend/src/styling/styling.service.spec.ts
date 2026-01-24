import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { StylingService } from './styling.service';
import { TenantStyling } from '../entities/tenant-styling.entity';

describe('StylingService', () => {
  let service: StylingService;
  let repository: Repository<TenantStyling>;

  const mockStyling: TenantStyling = {
    id: 'styling-uuid-1',
    tenantId: 'tenant-uuid-1',
    primaryColor: '#3B82F6',
    secondaryColor: '#6366F1',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter, system-ui, sans-serif',
    baseFontSize: '16px',
    maxContentWidth: '1200px',
    customCss: null,
    logoUrl: null,
    faviconUrl: null,
    updatedAt: new Date(),
    tenant: null as any,
  };

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StylingService,
        {
          provide: getRepositoryToken(TenantStyling),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<StylingService>(StylingService);
    repository = module.get<Repository<TenantStyling>>(
      getRepositoryToken(TenantStyling),
    );

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrUpdate', () => {
    it('should create new styling when none exists', async () => {
      const createDto = { primaryColor: '#FF0000' };
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        ...mockStyling,
        ...createDto,
      });
      mockRepository.save.mockResolvedValue({
        ...mockStyling,
        ...createDto,
      });

      const result = await service.createOrUpdate('tenant-uuid-1', createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-uuid-1' },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.primaryColor).toBe('#FF0000');
    });

    it('should update existing styling', async () => {
      const updateDto = { primaryColor: '#00FF00' };
      mockRepository.findOne.mockResolvedValue({ ...mockStyling });
      mockRepository.save.mockResolvedValue({
        ...mockStyling,
        ...updateDto,
      });

      const result = await service.createOrUpdate('tenant-uuid-1', updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-uuid-1' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(result.primaryColor).toBe('#00FF00');
    });
  });

  describe('findByTenantId', () => {
    it('should return styling for tenant', async () => {
      mockRepository.findOne.mockResolvedValue(mockStyling);

      const result = await service.findByTenantId('tenant-uuid-1');

      expect(result).toEqual(mockStyling);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { tenantId: 'tenant-uuid-1' },
      });
    });

    it('should throw NotFoundException when styling not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByTenantId('non-existent-tenant'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createDefaultStyling', () => {
    it('should return existing styling if already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockStyling);

      const result = await service.createDefaultStyling('tenant-uuid-1');

      expect(result).toEqual(mockStyling);
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should create default styling if none exists', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockStyling);
      mockRepository.save.mockResolvedValue(mockStyling);

      const result = await service.createDefaultStyling('tenant-uuid-1');

      expect(result).toEqual(mockStyling);
      expect(mockRepository.create).toHaveBeenCalledWith({
        tenantId: 'tenant-uuid-1',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('generateCssVariables', () => {
    it('should generate CSS variables from styling config', () => {
      const css = service.generateCssVariables(mockStyling);

      expect(css).toContain(':root {');
      expect(css).toContain('--primary-color: #3B82F6');
      expect(css).toContain('--secondary-color: #6366F1');
      expect(css).toContain('--background-color: #FFFFFF');
      expect(css).toContain('--text-color: #1F2937');
      expect(css).toContain('--font-family: Inter, system-ui, sans-serif');
      expect(css).toContain('--base-font-size: 16px');
      expect(css).toContain('--max-content-width: 1200px');
      expect(css).toContain('body {');
      expect(css).toContain('.container {');
    });

    it('should include logo and favicon URLs when present', () => {
      const stylingWithBranding = {
        ...mockStyling,
        logoUrl: 'https://example.com/logo.png',
        faviconUrl: 'https://example.com/favicon.ico',
      };

      const css = service.generateCssVariables(stylingWithBranding);

      expect(css).toContain(
        "--logo-url: url('https://example.com/logo.png')",
      );
      expect(css).toContain(
        "--favicon-url: url('https://example.com/favicon.ico')",
      );
    });

    it('should include custom CSS when present', () => {
      const stylingWithCustomCss = {
        ...mockStyling,
        customCss: '.custom-class { color: red; }',
      };

      const css = service.generateCssVariables(stylingWithCustomCss);

      expect(css).toContain('/* Custom CSS */');
      expect(css).toContain('.custom-class { color: red; }');
    });
  });
});
