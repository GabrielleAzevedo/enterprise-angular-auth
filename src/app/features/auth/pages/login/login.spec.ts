import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { ToastService } from '../../../../core/services/toast/toast.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { AuthError, AuthErrorCode } from '../../../../core/models/auth-errors';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: { signInWithEmail: Mock };
  let toastServiceMock: { success: Mock; warning: Mock; error: Mock };
  let routerMock: { navigate: Mock };

  beforeEach(async () => {
    authServiceMock = {
      signInWithEmail: vi.fn(),
    };

    toastServiceMock = {
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        provideRouter([]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    routerMock = {
      navigate: vi.spyOn(router, 'navigate'),
    };

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar', () => {
    expect(component).toBeTruthy();
  });

  it('deve marcar formulário como touched se inválido', () => {
    component.onSubmit();
    expect(component.form.touched).toBe(true);
    expect(authServiceMock.signInWithEmail).not.toHaveBeenCalled();
  });

  it('deve chamar signInWithEmail quando formulário válido', async () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    authServiceMock.signInWithEmail.mockResolvedValue({});

    await component.onSubmit();

    expect(authServiceMock.signInWithEmail).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('deve redirecionar para dashboard em caso de sucesso', async () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    authServiceMock.signInWithEmail.mockResolvedValue({});

    await component.onSubmit();

    expect(toastServiceMock.success).toHaveBeenCalledWith('Login realizado com sucesso!');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('deve tratar erro de Email Não Confirmado especificamente', async () => {
    component.form.patchValue({
      email: 'unverified@example.com',
      password: 'password123',
    });

    // Simula o erro de domínio exato
    const error = new AuthError(AuthErrorCode.EmailNotConfirmed, 'Email não confirmado');
    authServiceMock.signInWithEmail.mockRejectedValue(error);

    await component.onSubmit();

    expect(toastServiceMock.warning).toHaveBeenCalledWith(
      expect.stringContaining('confirme seu email'),
    );
    expect(routerMock.navigate).toHaveBeenCalledWith(['/verificar-email'], {
      state: { email: 'unverified@example.com' },
    });
  });

  it('deve relançar outros erros para o GlobalHandler', async () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    const genericError = new Error('Erro genérico');
    authServiceMock.signInWithEmail.mockRejectedValue(genericError);

    // Como o erro é relançado, precisamos garantir que o teste capture a promise rejeitada
    // Porém, no componente, o erro sobe e é pego pelo GlobalHandler (que não está mockado aqui no fluxo do teste unitário do componente em si, pois o Angular trata exceções não tratadas).
    // Mas no código do componente: "throw error".
    // Para testar isso, verificamos se o toast de warning NÃO foi chamado (significa que passou reto pelo if específico)

    try {
      await component.onSubmit();
    } catch (e) {
      expect(e).toBe(genericError);
    }

    expect(toastServiceMock.warning).not.toHaveBeenCalled();
    // O router não deve navegar para verificar-email
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve gerenciar estado de isLoading corretamente', async () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'password123',
    });

    // Promessa que demora para resolver para testarmos o estado true
    let resolvePromise: any;
    const slowPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    authServiceMock.signInWithEmail.mockReturnValue(slowPromise);

    const submitPromise = component.onSubmit();

    // Deve estar carregando agora
    expect(component.isLoading()).toBe(true);

    resolvePromise({});
    await submitPromise;

    // Deve ter parado de carregar
    expect(component.isLoading()).toBe(false);
  });
});
