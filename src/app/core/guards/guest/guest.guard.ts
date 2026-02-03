import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguarda o término do carregamento inicial da autenticação
  return toObservable(authService.isAuthLoading).pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      // Verifica o estado reativo do usuário
      const user = authService.currentUser();

      if (!user) {
        return true;
      }

      // Se estiver logado, redireciona para dashboard
      return router.createUrlTree(['/dashboard']);
    }),
  );
};
