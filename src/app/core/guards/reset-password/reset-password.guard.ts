import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { Observable } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ResetPasswordGuard implements CanActivate {
  private router = inject(Router);
  private authService = inject(AuthService);
  private isLoading$ = toObservable(this.authService.isAuthLoading);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const fragment = route.fragment;
    if (fragment) {
      const params = new URLSearchParams(fragment);
      const error = params.get('error');
      const errorCode = params.get('error_code');

      if (error === 'access_denied' || errorCode === 'otp_expired') {
        this.router.navigate(['/esqueci-senha'], {
          queryParams: { error: 'token_expired' },
        });
        return false;
      }
    }

    return this.isLoading$.pipe(
      filter((isLoading) => !isLoading),
      take(1),
      map(() => {
        const user = this.authService.currentUser();

        if (!user) {
          this.router.navigate(['/esqueci-senha'], {
            queryParams: { error: 'invalid_session' },
          });
          return false;
        }

        return true;
      }),
    );
  }
}
