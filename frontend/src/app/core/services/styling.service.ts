import { Injectable, Inject, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, catchError, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TenantStyling, DEFAULT_STYLING } from '../../models/tenant-styling.model';

// Re-export the interface for backward compatibility
export type { TenantStyling } from '../../models/tenant-styling.model';

/**
 * List of potentially dangerous CSS patterns that should be sanitized
 */
const DANGEROUS_CSS_PATTERNS = [
  /javascript:/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding/gi,
  /@import/gi,
  /@charset/gi,
  /url\s*\(\s*["']?\s*data:/gi,
];

/**
 * List of dangerous CSS properties that can be used for attacks
 */
const DANGEROUS_PROPERTIES = [
  'behavior',
  '-moz-binding',
];

@Injectable({
  providedIn: 'root'
})
export class StylingService {
  private readonly apiUrl = `${environment.apiUrl}/styling`;
  private renderer: Renderer2;
  private currentStylingSubject = new BehaviorSubject<TenantStyling | null>(null);
  public currentStyling$: Observable<TenantStyling | null> = this.currentStylingSubject.asObservable();
  private stylingLoaded = false;

  constructor(
    private http: HttpClient,
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
   * Check if styling has been loaded
   */
  isStylingLoaded(): boolean {
    return this.stylingLoaded;
  }

  /**
   * Load styling configuration from the API
   * Returns Observable<void> for use with APP_INITIALIZER
   * Falls back to defaults if API call fails
   */
  loadStyling(): Observable<void> {
    return this.http.get<TenantStyling>(this.apiUrl).pipe(
      tap((styling) => {
        this.stylingLoaded = true;
        this.applyStyling(styling);
      }),
      map(() => void 0),
      catchError((error: HttpErrorResponse) => {
        console.warn('Failed to load styling from API, using defaults:', error.message);
        this.stylingLoaded = true;
        this.applyDefaultStyling();
        // Return successfully to allow app to continue
        return of(void 0);
      })
    );
  }

  /**
   * Load styling for a specific tenant
   * @param tenantId The tenant identifier
   */
  loadStylingForTenant(tenantId: string): Observable<TenantStyling | null> {
    return this.http.get<TenantStyling>(`${this.apiUrl}/${tenantId}`).pipe(
      tap((styling) => {
        this.stylingLoaded = true;
        this.applyStyling(styling);
      }),
      catchError((error: HttpErrorResponse) => {
        console.warn(`Failed to load styling for tenant "${tenantId}":`, error.message);
        this.applyDefaultStyling();
        return of(null);
      })
    );
  }

  /**
   * Apply default styling values
   */
  private applyDefaultStyling(): void {
    this.applyStyling(DEFAULT_STYLING);
  }

  /**
   * Apply styling to the document
   */
  applyStyling(styling: TenantStyling): void {
    this.currentStylingSubject.next(styling);

    // Apply CSS custom properties to document.documentElement
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
    if (styling.baseFontSize !== undefined) {
      root.style.setProperty('--base-font-size', `${styling.baseFontSize}px`);
    }
    if (styling.maxContentWidth !== undefined) {
      root.style.setProperty('--max-content-width', `${styling.maxContentWidth}px`);
    }

    // Apply custom CSS if provided (with sanitization)
    if (styling.customCss) {
      this.injectCustomCss(styling.customCss);
    } else {
      // Remove any previously injected custom CSS
      this.removeCustomCss();
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

    // Remove custom properties (browser will fall back to :root values)
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--background-color');
    root.style.removeProperty('--text-color');
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--header-font-family');
    root.style.removeProperty('--base-font-size');
    root.style.removeProperty('--max-content-width');

    // Remove injected custom CSS
    this.removeCustomCss();
  }

  /**
   * Update tenant styling via API
   */
  updateStyling(tenantId: string, styling: Partial<TenantStyling>): Observable<TenantStyling> {
    return this.http.put<TenantStyling>(`${this.apiUrl}/${tenantId}`, styling).pipe(
      tap((updatedStyling) => {
        this.applyStyling(updatedStyling);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Failed to update styling for tenant "${tenantId}":`, error.message);
        throw error;
      })
    );
  }

  /**
   * Inject custom CSS into the document safely
   * Removes previous custom styles before applying new ones
   * Sanitizes CSS to prevent XSS attacks
   */
  injectCustomCss(css: string): void {
    // Remove any existing custom CSS first
    this.removeCustomCss();

    // Sanitize the CSS before injection
    const sanitizedCss = this.sanitizeCss(css);

    if (!sanitizedCss) {
      console.warn('Custom CSS was rejected due to potentially dangerous content');
      return;
    }

    const style = this.renderer.createElement('style');
    style.id = 'tenant-custom-css';
    style.type = 'text/css';
    style.textContent = sanitizedCss;
    this.renderer.appendChild(this.document.head, style);
  }

  /**
   * Remove injected custom CSS from the document
   */
  removeCustomCss(): void {
    const existingStyle = this.document.getElementById('tenant-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  /**
   * Sanitize CSS to prevent XSS and other injection attacks
   * @param css The raw CSS string to sanitize
   * @returns Sanitized CSS string or empty string if unsafe
   */
  private sanitizeCss(css: string): string {
    if (!css || typeof css !== 'string') {
      return '';
    }

    let sanitized = css;

    // Check for dangerous patterns
    for (const pattern of DANGEROUS_CSS_PATTERNS) {
      if (pattern.test(sanitized)) {
        console.warn(`Dangerous CSS pattern detected: ${pattern}`);
        return '';
      }
    }

    // Remove any script tags or event handlers that might have slipped through
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Check for dangerous properties
    for (const prop of DANGEROUS_PROPERTIES) {
      const propRegex = new RegExp(`${prop}\\s*:`, 'gi');
      if (propRegex.test(sanitized)) {
        console.warn(`Dangerous CSS property detected: ${prop}`);
        return '';
      }
    }

    // Basic validation: ensure balanced braces
    const openBraces = (sanitized.match(/{/g) || []).length;
    const closeBraces = (sanitized.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      console.warn('CSS has unbalanced braces');
      return '';
    }

    return sanitized.trim();
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
