import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Mail, Lock } from 'lucide-angular';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, ToastService } from '../../../../core/services';
import { AuthError, AuthErrorCode } from '../../../../core/models/auth-errors';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { InputComponent, ButtonComponent, BrandIconComponent } from '../../../../shared/components';
import { RouterLink, Router } from '@angular/router';
import { emailValidator } from '../../../../shared/validators/email.validators';

@Component({
  selector: 'app-login',
  imports: [
    LucideAngularModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    BrandIconComponent,
    AuthLayout,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  readonly Mail = Mail;
  readonly Lock = Lock;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
    password: ['', [Validators.required]],
  });

  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.authService.signInWithEmail(email!, password!);

      this.toastService.success('Login realizado com sucesso!');
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      // Verifica se é erro de email não confirmado usando o código tipado
      if (error instanceof AuthError && error.code === AuthErrorCode.EmailNotConfirmed) {
        this.toastService.warning('Por favor, confirme seu email antes de entrar.');
        this.router.navigate(['/verificar-email'], {
          state: { email: email },
        });
        return; // Impede que o erro suba para o GlobalHandler
      }

      // Repassa para o GlobalHandler se não for tratado aqui
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginWithGoogle() {
    try {
      this.isLoading.set(true);
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.toastService.error('Erro ao conectar com Google.');
    } finally {
      this.isLoading.set(false);
    }
  }
}