import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { RegisterComponent } from './register';
import {
  matchPasswordValidator,
  passwordStrengthValidator,
} from '../../../../shared/validators/password.validators';
import { AuthService, ToastService } from '../../../../core/services';
import { vi } from 'vitest';
import { provideRouter, Router } from '@angular/router';

class AuthServiceMock implements Partial<AuthService> {
  signUp = vi.fn().mockResolvedValue({ user: { email: 'test@example.com' }, session: null });
  signInWithGoogle = vi.fn().mockResolvedValue({});
}

class ToastServiceMock implements Partial<ToastService> {
  success = vi.fn();
  error = vi.fn();
  warning = vi.fn();
  show = vi.fn();
}

describe('Register', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthServiceMock;
  let toastService: ToastServiceMock;
  let router: Router;
  let navigateSpy: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: ToastService, useClass: ToastServiceMock },
        provideRouter([]), // Fornece o Router para o RouterLink funcionar
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    toastService = TestBed.inject(ToastService) as unknown as ToastServiceMock;
    router = TestBed.inject(Router);
    navigateSpy = vi.spyOn(router, 'navigate').mockImplementation(async () => true);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve iniciar com formulário inválido', () => {
    expect(component.form.valid).toBe(false);
  });

  it('deve habilitar o formulário quando todos os componentes estiverem corretos', () => {
    component.form.patchValue({
      email: 'test@example.com',
      password: 'SenhaForte1!',
      confirmPassword: 'SenhaForte1!',
    });
    expect(component.form.valid).toBe(true);
  });

  it('deve chamar o método signUp do serviço e exibir toast de sucesso ao submeter formulário válido', async () => {
    vi.spyOn(authService, 'signUp').mockResolvedValue({
      user: { email: 'test@example.com' },
      session: null,
    });

    component.form.patchValue({
      email: 'test@example.com',
      password: 'SenhaForte1!',
      confirmPassword: 'SenhaForte1!',
    });
    await component.registerWithEmail();

    expect(authService.signUp).toHaveBeenCalledWith('test@example.com', 'SenhaForte1!');
    expect(toastService.success).toHaveBeenCalledWith(
      expect.stringContaining('Cadastro realizado com sucesso'),
    );
    expect(navigateSpy).toHaveBeenCalledWith(['/verificar-email'], {
      state: { email: 'test@example.com' },
    });
  });

  it('deve exibir toast de warning e erro no campo do email se já estiver registrado', async () => {
    vi.spyOn(authService, 'signUp').mockRejectedValue({ message: 'User already registered' });

    component.form.patchValue({
      email: 'existe@teste.com',
      password: 'SenhaForte1!',
      confirmPassword: 'SenhaForte1!',
    });

    await component.registerWithEmail();

    expect(component.form.get('email')?.hasError('emailTaken')).toBe(true);
    expect(toastService.warning).toHaveBeenCalledWith('Este email já está cadastrado.');
  });

  it('deve exibir toast de warning se o backend retornar erro de email inválido', async () => {
    vi.spyOn(authService, 'signUp').mockRejectedValue({ message: 'Email not valid' });

    component.form.patchValue({
      email: 'valido@teste.com',
      password: 'SenhaForte1!',
      confirmPassword: 'SenhaForte1!',
    });

    await component.registerWithEmail();

    expect(component.form.get('email')?.hasError('emailInvalidBackend')).toBe(true);
    expect(toastService.warning).toHaveBeenCalledWith('Formato de email inválido.');
  });

  it('deve exibir toast de erro genérico para outros erros', async () => {
    vi.spyOn(authService, 'signUp').mockRejectedValue({ message: 'Server error' });

    component.form.patchValue({
      email: 'teste@teste.com',
      password: 'SenhaForte1!',
      confirmPassword: 'SenhaForte1!',
    });

    await component.registerWithEmail();

    expect(toastService.error).toHaveBeenCalledWith('Erro inesperado: Server error');
  });

  it('deve chamar signInWithGoogle ao clicar no botão do Google', async () => {
    await component.registerWithGoogle();
    expect(authService.signInWithGoogle).toHaveBeenCalled();
  });

  it('deve exibir toast de erro se o login com Google falhar', async () => {
    vi.spyOn(authService, 'signInWithGoogle').mockRejectedValue(new Error('Google error'));

    await component.registerWithGoogle();

    expect(toastService.error).toHaveBeenCalledWith(
      expect.stringContaining('Erro ao conectar com Google'),
    );
  });
});

describe('passwordStrengthValidator', () => {
  it('deve aceita senha forte', () => {
    const control = new FormControl('SenhaForte1!');
    const result = passwordStrengthValidator(control);

    expect(result).toBeNull();
  });

  it('deve aceitar valor vazio (required cuida disso)', () => {
    const control = new FormControl('');
    const result = passwordStrengthValidator(control);

    expect(result).toBeNull();
  });

  it('deve reprovar senha fraca', () => {
    const control = new FormControl('senha123'); // sem maiúscula e sem símbolo
    const result = passwordStrengthValidator(control);

    expect(result).toEqual({ passwordStrength: true });
  });
});

describe('matchPasswordValidator', () => {
  it('deve aceitar quando password e confirmPassword são iguais', () => {
    const form = new FormGroup({
      password: new FormControl('Senha1!'),
      confirmPassword: new FormControl('Senha1!'),
    });

    const result = matchPasswordValidator(form);

    expect(result).toBeNull();
  });

  it('deve marcar erro quando as senhas forem diferentes', () => {
    const form = new FormGroup({
      password: new FormControl('Senha1!'),
      confirmPassword: new FormControl('Outra1!'),
    });

    const result = matchPasswordValidator(form);

    expect(result).toEqual({ passwordMismatch: true });
  });
});
