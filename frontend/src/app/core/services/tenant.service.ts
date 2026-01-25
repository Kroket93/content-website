import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  domain?: string;
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
  private currentTenantSubject = new BehaviorSubject<Tenant | null>(null);
  public currentTenant$: Observable<Tenant | null> = this.currentTenantSubject.asObservable();

  constructor() {}

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
    if (pathParts.length > 0) {
      return pathParts[0];
    }

    return null;
  }

  /**
   * Load tenant configuration from the API
   * @param tenantId The tenant identifier
   */
  async loadTenant(tenantId: string): Promise<Tenant | null> {
    // TODO: Implement API call to load tenant
    // For now, return a stub
    console.log(`Loading tenant: ${tenantId}`);
    return null;
  }

  /**
   * Clear the current tenant context
   */
  clearTenant(): void {
    this.currentTenantSubject.next(null);
  }
}
