import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ToastService } from '../toast/toast.service';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../../environments/environment';
import { AuthError } from '../../models/auth-errors';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);
  private zone = inject(NgZone);

  handleError(error: any): void {
    const message = this.extractMessage(error);

    if (environment.production) {
      Sentry.captureException(error);
    } else {
      console.error('🔥 Erro Global Capturado:', error);
    }

    this.zone.run(() => {
      this.toastService.error(message);
    });
  }

  private extractMessage(error: any): string {
    if (error instanceof AuthError) {
      return error.toUserFriendlyMessage();
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error?.status === 0) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
