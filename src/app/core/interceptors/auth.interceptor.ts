import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, BehaviorSubject, filter, take, switchMap, from } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

// Mutex para controle de refresh token concorrente
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return from(authService.refreshSession()).pipe(
            switchMap((session) => {
              isRefreshing = false;
              const newToken = session.access_token;
              refreshTokenSubject.next(newToken);

              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${newToken}` },
                }),
              );
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              authService.handleUnauthorized();
              return throwError(() => refreshError);
            }),
          );
        } else {
          // Se já está renovando, aguarda o novo token
          return refreshTokenSubject.pipe(
            filter((token) => token !== null),
            take(1),
            switchMap((token) => {
              return next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${token}` },
                }),
              );
            }),
          );
        }
      }
      return throwError(() => error);
    }),
  );
};
