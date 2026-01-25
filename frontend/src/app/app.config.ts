import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER, inject } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { routes } from './app.routes';
import { TenantService } from './core/services/tenant.service';
import { StylingService } from './core/services/styling.service';

/**
 * Initialize tenant context and styling from URL
 * This identifies and loads the current tenant, then loads styling
 * Styling must be loaded after tenant to include the X-Tenant-ID header
 */
function initializeTenantAndStyling(): () => Promise<void> {
  const tenantService = inject(TenantService);
  const stylingService = inject(StylingService);
  return async () => {
    await tenantService.initializeTenant();
    await firstValueFrom(stylingService.loadStyling());
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeTenantAndStyling,
      multi: true
    }
  ]
};
