import { Injectable, Inject, NotFoundException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Tenant } from '../../entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { StylingService } from '../../styling/styling.service';

@Injectable()
export class TenantService {
  private readonly CACHE_TTL = 300000; // 5 minutes in milliseconds
  private readonly CACHE_PREFIX = 'tenant:';

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(forwardRef(() => StylingService))
    private readonly stylingService: StylingService,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    const tenant = this.tenantRepository.create(createTenantDto);
    const savedTenant = await this.tenantRepository.save(tenant);

    // Create default styling for the new tenant
    await this.stylingService.createDefaultStyling(savedTenant.id);

    return savedTenant;
  }

  async findAll(): Promise<Tenant[]> {
    return this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Tenant> {
    const cacheKey = `${this.CACHE_PREFIX}id:${id}`;
    const cached = await this.cacheManager.get<Tenant>(cacheKey);

    if (cached) {
      return cached;
    }

    const tenant = await this.tenantRepository.findOne({ where: { id } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID "${id}" not found`);
    }

    await this.cacheManager.set(cacheKey, tenant, this.CACHE_TTL);
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const cacheKey = `${this.CACHE_PREFIX}slug:${slug}`;
    const cached = await this.cacheManager.get<Tenant>(cacheKey);

    if (cached) {
      return cached;
    }

    const tenant = await this.tenantRepository.findOne({ where: { slug } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with slug "${slug}" not found`);
    }

    await this.cacheManager.set(cacheKey, tenant, this.CACHE_TTL);
    return tenant;
  }

  async findByDomain(domain: string): Promise<Tenant> {
    const cacheKey = `${this.CACHE_PREFIX}domain:${domain}`;
    const cached = await this.cacheManager.get<Tenant>(cacheKey);

    if (cached) {
      return cached;
    }

    const tenant = await this.tenantRepository.findOne({ where: { domain } });

    if (!tenant) {
      throw new NotFoundException(`Tenant with domain "${domain}" not found`);
    }

    await this.cacheManager.set(cacheKey, tenant, this.CACHE_TTL);
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.findOne(id);

    // Clear cache for old values before update
    await this.invalidateTenantCache(tenant);

    Object.assign(tenant, updateTenantDto);
    const updatedTenant = await this.tenantRepository.save(tenant);

    return updatedTenant;
  }

  async remove(id: string): Promise<void> {
    const tenant = await this.findOne(id);
    await this.invalidateTenantCache(tenant);
    await this.tenantRepository.remove(tenant);
  }

  private async invalidateTenantCache(tenant: Tenant): Promise<void> {
    const keysToDelete = [
      `${this.CACHE_PREFIX}id:${tenant.id}`,
      `${this.CACHE_PREFIX}slug:${tenant.slug}`,
    ];

    if (tenant.domain) {
      keysToDelete.push(`${this.CACHE_PREFIX}domain:${tenant.domain}`);
    }

    await Promise.all(keysToDelete.map((key) => this.cacheManager.del(key)));
  }
}
