import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AuthGateway } from '../../gateways/auth.gateway';
import { Router } from '@angular/router';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ApplicationRef } from '@angular/core';

describe('AuthService', () => {
  let service: AuthService;
  let authGatewayMock: any;
  let routerMock: any;
  let appRef: ApplicationRef;

  const setRouteData = (isPublic: boolean) => {
    routerMock.routerState.snapshot.root = {
      firstChild: {
        firstChild: null,
        data: { isPublic },
      },
    };
  };

  beforeEach(() => {
    authGatewayMock = {
      getCurrentUser: vi.fn().mockResolvedValue(null),
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      signInWithEmail: vi.fn(),
      signInWithGoogle: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updatePassword: vi.fn(),
    };

    // Getter para url para alterar dinamicamente nos testes
    let currentUrl = '/dashboard';

    routerMock = {
      navigate: vi.fn(),
      routerState: {
        snapshot: {
          root: {
            // Inicialmente vazio, configurado nos testes
            firstChild: null,
            data: {},
          },
        },
      },
      get url() {
        return currentUrl;
      },
      set url(value: string) {
        currentUrl = value;
      },
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: AuthGateway, useValue: authGatewayMock },
        { provide: Router, useValue: routerMock },
      ],
    });

    service = TestBed.inject(AuthService);
    appRef = TestBed.inject(ApplicationRef);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  it('deve redirecionar para /entrar se usuário deslogar em rota privada', () => {
    // Configura estado inicial: carregado e sem usuário
    routerMock.url = '/dashboard';
    setRouteData(false); 

    service.isAuthLoading.set(false);
    service.currentUser.set(null);

    appRef.tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/entrar']);
  });

  it('NÃO deve redirecionar se usuário deslogar em rota pública', () => {
    routerMock.url = '/cadastro';
    setRouteData(true);

    service.isAuthLoading.set(false);
    service.currentUser.set(null);

    appRef.tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('NÃO deve redirecionar enquanto estiver carregando', () => {
    routerMock.url = '/dashboard';
    setRouteData(false);

    service.isAuthLoading.set(true);
    service.currentUser.set(null);

    appRef.tick();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve redirecionar para /dashboard se usuário logar estando em rota pública', () => {
    // Cenário: Usuário entra na rota de login (/entrar) mas já tem sessão válida (ex: voltou do Google)
    routerMock.url = '/entrar';
    setRouteData(true);

    service.isAuthLoading.set(false);
    service.currentUser.set({ id: '123', email: 'test@test.com' } as any);

    appRef.tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});