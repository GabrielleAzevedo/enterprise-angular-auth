import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthService, ToastService } from '../../../../core/services/index';

import { ForgotPasswordComponent } from './forgot-password';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;

  const authServiceMock = {
    resetPassword: vi.fn(),
  };

  const toastServiceMock = {
    error: vi.fn(),
    success: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar com formulário inválido', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('deve validar o formato do email', () => {
    const emailControl = component.form.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBeFalsy();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('deve chamar authService.resetPassword quando o formulário for válido e submetido', async () => {
    const email = 'test@example.com';
    component.form.get('email')?.setValue(email);
    authServiceMock.resetPassword.mockResolvedValue(undefined);

    await component.onSubmit();

    expect(authServiceMock.resetPassword).toHaveBeenCalledWith(email);
    expect(component.emailSent()).toBe(true);
    expect(component.isLoading()).toBe(false);
  });

  it('deve tratar erro quando o serviço falhar', async () => {
    const errorMessage = 'Erro ao enviar email';
    authServiceMock.resetPassword.mockRejectedValue(new Error(errorMessage));

    component.form.get('email')?.setValue('teste@email.com');
    await component.onSubmit();

    expect(toastServiceMock.error).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
    expect(component.emailSent()).toBe(false);
    expect(component.isLoading()).toBe(false);
  });
});