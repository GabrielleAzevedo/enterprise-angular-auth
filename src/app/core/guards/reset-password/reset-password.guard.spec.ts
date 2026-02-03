import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { ResetPasswordGuard } from './reset-password.guard';
import { AuthService } from '../../services/auth/auth.service';
import { signal, WritableSignal } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { firstValueFrom } from 'rxjs';

describe('ResetPasswordGuard', () => {
  let guard: ResetPasswordGuard;
  let authServiceMock: { isAuthLoading: WritableSignal<boolean>; currentUser: WritableSignal<any> };
  let routerMock: { navigate: any };
  let routeMock: any;

  beforeEach(() => {
    authServiceMock = {
      isAuthLoading: signal(true),
      currentUser: signal(null),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    routeMock = {
      fragment: null,
    };

    TestBed.configureTestingModule({
      providers: [
        ResetPasswordGuard,
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    guard = TestBed.inject(ResetPasswordGuard);
  });

  it('deve redirecionar se houver erro no fragmento da URL', () => {
    routeMock.fragment = 'error=access_denied&error_description=Access+denied';

    const result = guard.canActivate(routeMock);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/esqueci-senha'], {
      queryParams: { error: 'token_expired' },
    });
  });

  it('deve aguardar isAuthLoading e permitir acesso se usuário estiver autenticado', async () => {
    // Inicialmente carregando
    authServiceMock.isAuthLoading.set(true);
    authServiceMock.currentUser.set(null);

    const result$ = guard.canActivate(routeMock) as any;
    const resultPromise = firstValueFrom(result$);

    // Simula término do carregamento com usuário logado
    authServiceMock.currentUser.set({ id: '123' });
    authServiceMock.isAuthLoading.set(false);

    const result = await resultPromise;
    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve aguardar isAuthLoading e redirecionar se usuário NÃO estiver autenticado', async () => {
    // Inicialmente carregando
    authServiceMock.isAuthLoading.set(true);
    authServiceMock.currentUser.set(null);

    const result$ = guard.canActivate(routeMock) as any;
    const resultPromise = firstValueFrom(result$);

    // Simula término do carregamento SEM usuário logado
    authServiceMock.currentUser.set(null);
    authServiceMock.isAuthLoading.set(false);

    const result = await resultPromise;
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/esqueci-senha'], {
      queryParams: { error: 'invalid_session' },
    });
  });
});
