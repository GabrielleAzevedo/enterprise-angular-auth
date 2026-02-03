import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../services';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Aguarda o término do carregamento inicial da autenticação
  return toObservable(authService.isAuthLoading).pipe(
    filter((isLoading) => !isLoading),
    take(1),
    map(() => {
      // Verifica o estado reativo do usuário
      const user = authService.currentUser();

      if (user) {
        return true;
      }

      // Se não estiver logado, redireciona para login
      return router.createUrlTree(['/entrar']);
    }),
  );
};
