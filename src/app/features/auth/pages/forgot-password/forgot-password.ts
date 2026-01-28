import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input';
import { LucideAngularModule, Mail, ArrowLeft } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { RouterLink } from '@angular/router';
import { ToastService, AuthService } from '../../../../core/services/index';
import { emailValidator } from '../../../../shared/validators/email.validators';

@Component({
  selector: 'app-forgot-password',
  imports: [
    AuthLayout,
    LucideAngularModule,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  readonly Mail = Mail;
  readonly ArrowLeft = ArrowLeft;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isLoading = signal(false);
  emailSent = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, emailValidator]],
  });

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    const email = this.form.get('email')?.value;

    try {
      await this.authService.resetPassword(email!);
      this.emailSent.set(true);
    } catch (error: any) {
      this.toastService.error('Erro ao enviar email: ' + error.message);
    } finally {
      this.isLoading.set(false);
    }
  }
}