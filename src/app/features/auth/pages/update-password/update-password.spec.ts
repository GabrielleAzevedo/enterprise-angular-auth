import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UpdatePasswordComponent } from './update-password';
import { AuthService, ToastService } from '../../../../core/services';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { vi, Mock } from 'vitest';

describe('UpdatePasswordComponent', () => {
  let component: UpdatePasswordComponent;
  let fixture: ComponentFixture<UpdatePasswordComponent>;
  let authServiceMock: { updatePassword: Mock; isAuthLoading: Mock; currentUser: Mock };
  let toastServiceMock: { error: Mock; success: Mock };
  let routerMock: { navigate: Mock };
  let routeMock: any;
  let fragmentSubject: BehaviorSubject<string | null>;

  beforeEach(async () => {
    authServiceMock = {
      updatePassword: vi.fn(),
      isAuthLoading: vi.fn(() => false),
      currentUser: vi.fn(() => ({ id: '123' })),
    };

    toastServiceMock = {
      error: vi.fn(),
      success: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    fragmentSubject = new BehaviorSubject<string | null>(null);
    routeMock = {
      fragment: fragmentSubject.asObservable(),
    };

    await TestBed.configureTestingModule({
      imports: [UpdatePasswordComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: routeMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePasswordComponent);
    component = fixture.componentInstance;
    // Não detectamos mudanças aqui para permitir sobrescrever mocks antes do ngOnInit em alguns testes
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar o componente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Validação de Token na Inicialização', () => {
    it('deve invalidar token se houver erro no fragmento da URL', () => {
      // Simula erro na URL
      fragmentSubject.next('error=access_denied&error_description=Link+expired');

      fixture.detectChanges(); // Dispara ngOnInit

      expect(component.isTokenValid()).toBe(false);
    });

    it('deve invalidar token se houver error_code otp_expired no fragmento', () => {
      fragmentSubject.next('error_code=otp_expired');

      fixture.detectChanges();

      expect(component.isTokenValid()).toBe(false);
    });

    it('deve invalidar token se não houver sessão ativa após verificação', async () => {
      authServiceMock.isAuthLoading.mockReturnValue(false);
      authServiceMock.currentUser.mockReturnValue(null);
      fixture.detectChanges();

      expect(component.isTokenValid()).toBe(false);
    });

    it('deve manter token válido se houver sessão ativa e sem erros na URL', async () => {
      fixture.detectChanges();

      expect(component.isTokenValid()).toBe(true);
    });
  });

  describe('Validação de Formulário', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Inicializa normal
    });

    it('deve invalidar formulário vazio', () => {
      expect(component.form.valid).toBe(false);
      expect(component.form.get('password')?.hasError('required')).toBe(true);
    });

    it('deve validar correspondência de senhas', () => {
      component.form.patchValue({
        password: 'Password123!',
        confirmPassword: 'Password123', // Diferente
      });

      expect(component.form.hasError('passwordMismatch')).toBe(true);
    });

    it('deve validar força da senha', () => {
      component.form.patchValue({
        password: 'weak',
        confirmPassword: 'weak',
      });

      expect(component.form.get('password')?.hasError('minlength')).toBe(true); // < 6 chars

      component.form.patchValue({
        password: 'password123', // Sem maiúscula/especial
        confirmPassword: 'password123',
      });

      expect(component.form.get('password')?.hasError('passwordStrength')).toBe(true);
    });

    it('deve ser válido com senha forte e correspondente', () => {
      component.form.patchValue({
        password: 'StrongPassword1!',
        confirmPassword: 'StrongPassword1!',
      });

      expect(component.form.valid).toBe(true);
    });
  });

  describe('Envio do Formulário', () => {
    beforeEach(() => {
      fixture.detectChanges();
      // Preenche formulário válido
      component.form.patchValue({
        password: 'StrongPassword1!',
        confirmPassword: 'StrongPassword1!',
      });
    });

    it('deve chamar updatePassword do serviço ao submeter formulário válido', async () => {
      authServiceMock.updatePassword.mockResolvedValue({});

      await component.onSubmit();

      expect(authServiceMock.updatePassword).toHaveBeenCalledWith('StrongPassword1!');
      expect(component.passwordUpdated()).toBe(true);
    });

    it('deve exibir erro se atualização falhar', async () => {
      const errorMsg = 'Falha na conexão';
      authServiceMock.updatePassword.mockRejectedValue(new Error(errorMsg));

      await component.onSubmit();

      expect(toastServiceMock.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg));
      expect(component.passwordUpdated()).toBe(false);
    });

    it('não deve chamar serviço se formulário for inválido', async () => {
      component.form.patchValue({ password: '' }); // Inválido

      await component.onSubmit();

      expect(authServiceMock.updatePassword).not.toHaveBeenCalled();
    });
  });
});
