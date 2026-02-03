import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { InputComponent, ButtonComponent, BrandIconComponent } from '../../../../shared/components';
import { LucideAngularModule, Mail, Lock } from 'lucide-angular';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService, ToastService } from '../../../../core/services';
import { RouterLink, Router } from '@angular/router';
import {
  matchPasswordValidator,
  passwordStrengthValidator,
} from '../../../../shared/validators/password.validators';
import { emailValidator } from '../../../../shared/validators/email.validators';
import { AuthError, AuthErrorCode } from '../../../../core/models/auth-errors';
import { FocusInvalidInputDirective } from '../../../../shared/directives/focus-invalid-input.directive';

@Component({
  selector: 'app-register',
  imports: [
    AuthLayout,
    InputComponent,
    ButtonComponent,
    BrandIconComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterLink,
    FocusInvalidInputDirective,
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  readonly Mail = Mail;
  readonly Lock = Lock;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private authService = inject(AuthService);
  isLoading = signal(false);

  form = this.fb.group(
    {
      email: ['', [Validators.required, emailValidator]],
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswordValidator },
  );

  onSubmit() {
    this.registerWithEmail();
  }

  async registerWithEmail() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { email, password } = this.form.getRawValue();

    try {
      await this.authService.signUp(email!, password!);

      this.toastService.success('Cadastro realizado com sucesso! Verifique seu email.');

      this.router.navigate(['/verificar-email'], {
        state: { email: email },
      });
    } catch (error: any) {
      if (error instanceof AuthError) {
        if (error.code === AuthErrorCode.UserAlreadyRegistered) {
          this.form.get('email')?.setErrors({ emailTaken: true });
          this.toastService.warning(error.toUserFriendlyMessage());
        } else if (
          error.code === AuthErrorCode.InvalidCredentials ||
          error.code === AuthErrorCode.EmailNotConfirmed
        ) {
          this.form.get('email')?.setErrors({ emailInvalidBackend: true });
          this.toastService.warning(error.toUserFriendlyMessage());
        } else {
          this.toastService.error(error.toUserFriendlyMessage());
        }
      } else {
        this.toastService.error('Erro inesperado ao realizar cadastro.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async registerWithGoogle() {
    this.isLoading.set(true);

    try {
      await this.authService.signInWithGoogle();
    } catch (error: any) {
      this.toastService.error('Erro ao conectar com Google: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}
