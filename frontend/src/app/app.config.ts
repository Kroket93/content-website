import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { TenantService } from './core/services/tenant.service';
import { StylingService } from './core/services/styling.service';

/**
 * Initialize tenant context from URL
 * This identifies and loads the current tenant
 */
function initializeTenant(): () => Promise<void> {
  const tenantService = inject(TenantService);
  return () => tenantService.initializeTenant();
}

/**
 * Initialize styling from API before app renders
 * Falls back to defaults if API call fails
 */
function initializeStyling(): () => Promise<void> {
  const stylingService = inject(StylingService);
  return () => firstValueFrom(stylingService.loadStyling());
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTenant,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeStyling,
      multi: true
    }
  ]
};
