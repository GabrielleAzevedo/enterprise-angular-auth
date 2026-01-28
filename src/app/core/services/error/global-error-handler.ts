import { ErrorHandler, Injectable, Injector, NgZone, inject } from '@angular/core';
import { ToastService } from '../toast/toast.service';
import * as Sentry from '@sentry/angular';
import { environment } from '../../../../environments/environment.example';
import { AuthError,  } from '../../models/auth-errors';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private injector = inject(Injector);
  private zone = inject(NgZone);

  handleError(error: any): void {
    const message = this.extractMessage(error);

    if (environment.production) {
      // Em produção: Envia silenciosamente para o Sentry
      Sentry.captureException(error);
    } else {
      // Em desenvolvimento: Loga no console para debug
      console.error('🔥 Erro Global Capturado:', error);
    }

    // Usa NgZone para garantir que o Toast apareça mesmo se o erro ocorrer fora do ciclo do Angular
    this.zone.run(() => {
      const toastService = this.injector.get(ToastService);
      toastService.error(message);
    });
  }

  private extractMessage(error: any): string {
    if (error instanceof AuthError) {
      // Se for um erro conhecido, usa a mensagem amigável dele
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    // Erros de HTTP/Network
    if (error?.status === 0) {
      return 'Erro de conexão. Verifique sua internet.';
    }

    return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}
