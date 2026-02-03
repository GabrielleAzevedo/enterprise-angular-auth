import { ApplicationConfig, ErrorHandler, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { init as sentryInit } from '@sentry/angular';

import { routes } from './app.routes';
import { AuthGateway } from './core/gateways/auth.gateway';
import { GlobalErrorHandler } from './core/services/error/global-error-handler';
import { SupabaseAuthGateway } from './core/adapters/supabase/supabase-auth.gateway';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { environment } from '../environments/environment';

export function initializeAuth(authService: AuthService) {
  return () => authService.init();
}

import { AuthService } from './core/services/auth/auth.service';
import { APP_INITIALIZER } from '@angular/core';

// Inicializa o Sentry o mais cedo possível
sentryInit({
  dsn: environment.sentryDsn,
  enabled: environment.production, // Só ativa em produção
  tracesSampleRate: 1.0, // Captura 100% das transações para performance
  replaysSessionSampleRate: 0.1, // Grava 10% das sessões para replay
  replaysOnErrorSampleRate: 1.0, // Grava 100% das sessões que tiveram erro
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: AuthGateway, useClass: SupabaseAuthGateway },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true,
    },
  ],
};
