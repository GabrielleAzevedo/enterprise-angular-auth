import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  provideHttpClient,
  withInterceptors,
  HttpClient,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '../services/auth/auth.service';
import { AuthState } from '../services/auth/auth.state';
import { vi, describe, it, expect, beforeEach, Mocked } from 'vitest';
import { throwError, of } from 'rxjs';
import { AuthSession } from '../models/user.model';
import { Signal } from '@angular/core';

describe('AuthInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceMock: Partial<Mocked<AuthService>>;
  let authStateMock: Partial<Mocked<AuthState>>;

  beforeEach(() => {
    // Criar um signal simulado que seja compatível com o tipo esperado pelo Vitest Mocked
    const accessTokenSignal = vi.fn(() => 'fake-token') as unknown as Signal<string | null>;

    authServiceMock = {
      accessToken: accessTokenSignal,
      refreshSession: vi.fn().mockResolvedValue({
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: '123', aud: 'authenticated', created_at: '' },
      } as AuthSession),
      handleUnauthorized: vi.fn(),
    } as unknown as Partial<Mocked<AuthService>>; // Força o tipo para evitar erro de TS estrito no teste

    authStateMock = {
      // Mock methods needed by AuthService internally if any,
      // but here we are mocking AuthService directly.
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: AuthState, useValue: authStateMock },
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve adicionar o token de autorização se existir', () => {
    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');
  });

  it('deve tentar refresh token quando receber 401', async () => {
    // Configura o mock do refresh para retornar imediatamente (sem promise pendente indefinidamente)
    (authServiceMock.refreshSession as any).mockReturnValue(
      Promise.resolve({
        access_token: 'new-token',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: '123', aud: 'authenticated', created_at: '' },
      }),
    );

    httpClient.get('/api/data').subscribe();

    const req = httpMock.expectOne('/api/data');

    // Simula erro 401
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Aguarda microtasks para o switchMap processar
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Deve chamar refreshSession
    expect(authServiceMock.refreshSession).toHaveBeenCalled();

    // Deve refazer a requisição com o novo token
    const retryReq = httpMock.expectOne('/api/data');
    expect(retryReq.request.headers.get('Authorization')).toBe('Bearer new-token');
    retryReq.flush({ data: 'success' });
  });

  it('deve chamar handleUnauthorized se o refresh falhar', async () => {
    // Configura refresh para falhar
    (authServiceMock.refreshSession as any).mockRejectedValue(new Error('Refresh failed'));

    // Configura o interceptor para ser testado
    // Como o catchError do interceptor repassa o erro original se o refresh falhar,
    // esperamos receber o erro do refresh (ou o 401 original, dependendo da implementação)
    // No código original: return throwError(() => refreshError); (retorna o erro do refresh)

    let errorResponse: any;

    httpClient.get('/api/data').subscribe({
      error: (error) => {
        errorResponse = error;
      },
    });

    const req = httpMock.expectOne('/api/data');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Aguarda microtasks
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(authServiceMock.handleUnauthorized).toHaveBeenCalled();
    // Verifica se o erro propagado é o erro do refresh ou o original (dependendo da implementação)
    expect(errorResponse).toBeTruthy();
  });

  it('deve lidar com concorrência (mutex) fazendo apenas UM refresh para múltiplos requests', async () => {
    // Configura um delay no refresh para simular latência e testar o mutex
    authServiceMock.refreshSession = vi.fn().mockReturnValue(
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              access_token: 'delayed-new-token',
              refresh_token: 'new-refresh',
              expires_in: 3600,
              token_type: 'bearer',
              user: { id: '123', aud: 'authenticated', created_at: '' },
            }),
          10, // Delay reduzido para teste
        ),
      ),
    );

    // Dispara 3 requests simultâneos
    httpClient.get('/api/1').subscribe();
    httpClient.get('/api/2').subscribe();
    httpClient.get('/api/3').subscribe();

    const req1 = httpMock.expectOne('/api/1');
    const req2 = httpMock.expectOne('/api/2');
    const req3 = httpMock.expectOne('/api/3');

    // Todos falham com 401
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    req2.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    req3.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Aguarda o tempo do delay do refresh + processamento
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Deve ter chamado refreshSession APENAS UMA VEZ
    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);

    // Deve refazer todos os 3 requests com o novo token
    const retryReq1 = httpMock.expectOne('/api/1');
    const retryReq2 = httpMock.expectOne('/api/2');
    const retryReq3 = httpMock.expectOne('/api/3');

    expect(retryReq1.request.headers.get('Authorization')).toBe('Bearer delayed-new-token');
    expect(retryReq2.request.headers.get('Authorization')).toBe('Bearer delayed-new-token');
    expect(retryReq3.request.headers.get('Authorization')).toBe('Bearer delayed-new-token');

    retryReq1.flush({ data: 1 });
    retryReq2.flush({ data: 2 });
    retryReq3.flush({ data: 3 });
  });
});
