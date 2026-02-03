import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/guest/guest.guard';
import { authGuard } from './core/guards/auth/auth.guard';
import { ResetPasswordGuard } from './core/guards/reset-password/reset-password.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'entrar',
  },
  {
    path: 'entrar',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'verificar-email',
    loadComponent: () =>
      import('./features/auth/pages/verify-email/verify-email').then((m) => m.VerifyEmailComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent,
      ),
    canActivate: [guestGuard],
  },
  {
    path: 'definir-nova-senha',
    loadComponent: () =>
      import('./features/auth/pages/update-password/update-password').then(
        (m) => m.UpdatePasswordComponent,
      ),
    canActivate: [ResetPasswordGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
];
