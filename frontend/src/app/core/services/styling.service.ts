import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantService } from './tenant.service';

export interface TenantStyling {
  id: string;
  tenantId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  fontFamily?: string;
  headerFontFamily?: string;
  logoUrl?: string;
  faviconUrl?: string;
  customCss?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StylingService {
  private readonly apiUrl = `${environment.apiUrl}/styling`;
  private renderer: Renderer2;
  private currentStylingSubject = new BehaviorSubject<TenantStyling | null>(null);
  public currentStyling$: Observable<TenantStyling | null> = this.currentStylingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private tenantService: TenantService,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  /**
   * Get the current styling configuration
   */
  getCurrentStyling(): TenantStyling | null {
    return this.currentStylingSubject.getValue();
  }

  /**
   * Load styling configuration for a tenant
   */
  loadStyling(tenantId: string): Observable<TenantStyling | null> {
    // TODO: Implement API call
    // return this.http.get<TenantStyling>(`${this.apiUrl}/${tenantId}`);
    console.log('Loading styling for tenant:', tenantId);
    return of(null);
  }

  /**
   * Apply styling to the document
   */
  applyStyling(styling: TenantStyling): void {
    this.currentStylingSubject.next(styling);

    // Apply CSS custom properties
    const root = this.document.documentElement;

    if (styling.primaryColor) {
      root.style.setProperty('--primary-color', styling.primaryColor);
    }
    if (styling.secondaryColor) {
      root.style.setProperty('--secondary-color', styling.secondaryColor);
    }
    if (styling.accentColor) {
      root.style.setProperty('--accent-color', styling.accentColor);
    }
    if (styling.backgroundColor) {
      root.style.setProperty('--background-color', styling.backgroundColor);
    }
    if (styling.textColor) {
      root.style.setProperty('--text-color', styling.textColor);
    }
    if (styling.fontFamily) {
      root.style.setProperty('--font-family', styling.fontFamily);
    }
    if (styling.headerFontFamily) {
      root.style.setProperty('--header-font-family', styling.headerFontFamily);
    }

    // Apply custom CSS if provided
    if (styling.customCss) {
      this.injectCustomCss(styling.customCss);
    }

    // Update favicon if provided
    if (styling.faviconUrl) {
      this.updateFavicon(styling.faviconUrl);
    }
  }

  /**
   * Reset styling to defaults
   */
  resetStyling(): void {
    this.currentStylingSubject.next(null);
    const root = this.document.documentElement;

    // Remove custom properties
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--background-color');
    root.style.removeProperty('--text-color');
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--header-font-family');

    // Remove injected custom CSS
    this.removeCustomCss();
  }

  /**
   * Update tenant styling via API
   */
  updateStyling(tenantId: string, styling: Partial<TenantStyling>): Observable<TenantStyling> {
    // TODO: Implement API call
    // return this.http.put<TenantStyling>(`${this.apiUrl}/${tenantId}`, styling);
    console.log('Updating styling for tenant:', tenantId, styling);
    return of(styling as TenantStyling);
  }

  /**
   * Inject custom CSS into the document
   */
  private injectCustomCss(css: string): void {
    this.removeCustomCss();

    const style = this.renderer.createElement('style');
    style.id = 'tenant-custom-css';
    style.textContent = css;
    this.renderer.appendChild(this.document.head, style);
  }

  /**
   * Remove injected custom CSS
   */
  private removeCustomCss(): void {
    const existingStyle = this.document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  /**
   * Update the page favicon
   */
  private updateFavicon(faviconUrl: string): void {
    const link: HTMLLinkElement | null = this.document.querySelector("link[rel*='icon']");
    if (link) {
      link.href = faviconUrl;
    } else {
      const newLink = this.renderer.createElement('link');
      newLink.rel = 'icon';
      newLink.href = faviconUrl;
      this.renderer.appendChild(this.document.head, newLink);
    }
  }
}
