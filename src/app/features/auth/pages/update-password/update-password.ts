import { Component, inject, signal, OnInit, ChangeDetectionStrategy, effect } from '@angular/core';
import { AuthLayout } from '../../components/auth-layout/auth-layout';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/components/input/input';
import { LucideAngularModule, Lock, CircleCheck, CircleAlert } from 'lucide-angular';
import { ButtonComponent } from '../../../../shared/components/button/button';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { AuthService, ToastService } from '../../../../core/services';
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
  ],
  templateUrl: './update-password.html',
  styleUrl: './update-password.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpdatePasswordComponent implements OnInit {
  readonly Lock = Lock;
  readonly CircleCheck = CircleCheck;
  readonly AlertCircle = CircleAlert;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  passwordUpdated = signal(false);
  isTokenValid = signal(true);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6), passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: matchPasswordValidator },
  );

  constructor() {
    effect(() => {
      // Monitora o estado de autenticação de forma reativa
      if (!this.authService.isAuthLoading()) {
        const user = this.authService.currentUser();
        // Se carregou e não tem usuário, e o token não foi invalidado explicitamente pelo hash
        if (!user && this.isTokenValid()) {
          this.isTokenValid.set(false);
        }
      }
    });
  }

  async ngOnInit() {
    // 1. Verifica erros na URL (hash fragment)
    this.route.fragment.subscribe((fragment) => {
      if (fragment) {
        const params = new URLSearchParams(fragment);
        const error = params.get('error');
        const errorCode = params.get('error_code');

        if (error === 'access_denied' || errorCode === 'otp_expired') {
          this.isTokenValid.set(false);
          return;
        }
      }
    });
  }

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
    } catch (error: any) {
      this.toastService.error(error.message || 'Erro ao atualizar senha');
      this.passwordUpdated.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }
}