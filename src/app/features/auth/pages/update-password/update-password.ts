import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input';
import { LucideAngularModule, Lock, CircleCheck, CircleAlert } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { RouterLink, Router } from '@angular/router';
import { AuthService, ToastService } from '../../../../core/services';
import { FocusInvalidInputDirective } from '../../../../shared/directives/focus-invalid-input.directive';
import {
  matchPasswordValidator,
  passwordStrengthValidator,
} from '../../../../shared/validators/password.validators';

@Component({
  selector: 'app-update-password',
  imports: [
    AuthLayout,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    RouterLink,
    FocusInvalidInputDirective,
  ],
  templateUrl: './update-password.html',
  styleUrl: './update-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordComponent {
  readonly Lock = Lock;
  readonly CircleCheck = CircleCheck;
  readonly AlertCircle = CircleAlert;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(false);
  passwordUpdated = signal(false);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswordValidator },
  );

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const { password } = this.form.getRawValue();

    try {
      await this.authService.updatePassword(password!);
      this.passwordUpdated.set(true);
      this.toastService.success('Senha atualizada com sucesso!');

      // Redireciona para o login após 3 segundos
      setTimeout(() => {
        this.router.navigate(['/entrar']);
      }, 3000);
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao atualizar senha');
      this.passwordUpdated.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }
}
