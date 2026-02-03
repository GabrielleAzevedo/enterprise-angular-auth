import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { AuthService } from '../../core/services';
import { Router } from '@angular/router';
import { ButtonComponent, CardComponent, LogoComponent } from '../../shared/components';
import { LucideAngularModule, User, RefreshCw } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [ButtonComponent, CardComponent, LogoComponent, LucideAngularModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Ícones
  User = User;
  RefreshCw = RefreshCw;

  // Acessa o usuário atual via Signal
  currentUser = this.authService.currentUser;
  isRefreshing = signal(false);

  async logout() {
    await this.authService.signOut();
    // Navegação removida pois o AuthService (ou o efeito global) já deve lidar com o fluxo pós-logout
  }

  async refreshData() {
    this.isRefreshing.set(true);
    await this.authService.refreshSession();
    this.isRefreshing.set(false);
  }
}