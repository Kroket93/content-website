import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  isActive?: boolean;
  settings?: TenantSettings;
}

export interface TenantSettings {
  primaryColor?: string;
  secondaryColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private currentTenantSubject = new BehaviorSubject<Tenant | null>(null);
  public currentTenant$: Observable<Tenant | null> = this.currentTenantSubject.asObservable();

  /**
   * Get the current tenant
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenantSubject.getValue();
  }

  /**
   * Set the current tenant context
   */
  setCurrentTenant(tenant: Tenant): void {
    this.currentTenantSubject.next(tenant);
  }

  /**
   * Identify tenant from the current URL (subdomain or path)
   * This should be called during app initialization
   */
  identifyTenantFromUrl(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');

    // Check for subdomain-based tenant (e.g., blog1.example.com)
    if (parts.length > 2) {
      return parts[0];
    }

    // Check for path-based tenant (e.g., /tenant1/)
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0 && !['blog', 'home', 'about', 'contact', 'admin'].includes(pathParts[0])) {
      return pathParts[0];
    }

    return null;
  }

  /**
   * Load tenant configuration from the API
   * @param tenantSlug The tenant slug/identifier
   */
  async loadTenant(tenantSlug: string): Promise<Tenant | null> {
    try {
      const tenant = await firstValueFrom(
        this.http.get<Tenant>(`${this.apiUrl}/tenants/by-slug/${tenantSlug}`)
      );
      if (tenant) {
        this.setCurrentTenant(tenant);
      }
      return tenant;
    } catch (error) {
      console.error(`Failed to load tenant with slug "${tenantSlug}":`, error);
      return null;
    }
  }

  /**
   * Initialize tenant context - called during app initialization
   * Tries to identify and load tenant from URL
   */
  async initializeTenant(): Promise<void> {
    const tenantSlug = this.identifyTenantFromUrl();

    if (tenantSlug) {
      await this.loadTenant(tenantSlug);
    } else {
      // For local development or when no tenant is identified from URL,
      // try to load a default tenant
      await this.loadDefaultTenant();
    }
  }

  /**
   * Load the default tenant for the application
   * Used when no tenant can be identified from URL
   */
  private async loadDefaultTenant(): Promise<void> {
    try {
      // Try to load a default tenant (e.g., 'default' or the first available tenant)
      const tenant = await firstValueFrom(
        this.http.get<Tenant>(`${this.apiUrl}/tenants/by-slug/default`)
      );
      if (tenant) {
        this.setCurrentTenant(tenant);
      }
    } catch {
      console.warn('No default tenant found. Content requests may fail without a tenant context.');
    }
  }

  /**
   * Clear the current tenant context
   */
  clearTenant(): void {
    this.currentTenantSubject.next(null);
  }
}
