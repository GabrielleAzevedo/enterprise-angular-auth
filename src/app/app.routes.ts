import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'entrar',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  {
    path: 'entrar',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.LoginComponent),
    data: { isPublic: true },
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterComponent),
    data: { isPublic: true },
  },
  {
    path: 'verificar-email',
    loadComponent: () =>
      import('./features/auth/pages/verify-email/verify-email').then((m) => m.VerifyEmailComponent),
    data: { isPublic: true },
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password').then(
        (m) => m.ForgotPasswordComponent,
      ),
    data: { isPublic: true },
  },
  {
    path: 'atualizar-senha',
    loadComponent: () =>
      import('./features/auth/pages/update-password/update-password').then(
        (m) => m.UpdatePasswordComponent,
      ),
    canActivate: [authGuard],
  },
];