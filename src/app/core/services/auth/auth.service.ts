import { Injectable, inject, signal, effect } from '@angular/core';
import { AuthGateway } from '../../gateways/auth.gateway';
import { User } from '../../models/user.model';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authGateway = inject(AuthGateway);
  private router = inject(Router);

  currentUser = signal<User | null>(null);
  isAuthLoading = signal(true);

  constructor() {
    this.authGateway.getCurrentUser().then((user) => {
      this.currentUser.set(user);
      this.isAuthLoading.set(false);
    });

    this.authGateway.onAuthStateChange((user) => {
      this.currentUser.set(user);
    });

    // Reage tanto à perda de sessão quanto ao ganho de sessão em rotas públicas
    effect(() => {
      const user = this.currentUser();
      const isLoading = this.isAuthLoading();

      if (!isLoading) {
        let route = this.router.routerState.snapshot.root;
        while (route.firstChild) {
          route = route.firstChild;
        }

        const isPublicRoute = route.data['isPublic'] === true;
        const currentUrl = this.router.url.split('?')[0];

        if (user && isPublicRoute) {
          // Se usuário está logado e tenta acessar rota pública -> Dashboard
          this.router.navigate(['/dashboard']);
        } else if (!user && !isPublicRoute && currentUrl !== '/') {
          // Se usuário NÃO está logado e tenta acessar rota privada -> Login
          this.router.navigate(['/entrar']);
        }
      }
    });
  }

  async signUp(email: string, password: string) {
    return this.authGateway.signUp(email, password);
  }

  async getSession() {
    return this.authGateway.getSession();
  }

  async signInWithEmail(email: string, password: string) {
    return this.authGateway.signInWithEmail(email, password);
  }

  async refreshSession() {
    this.isAuthLoading.set(true);
    try {
      const user = await this.authGateway.getCurrentUser();
      this.currentUser.set(user);
    } catch (error) {
      this.currentUser.set(null);
    } finally {
      this.isAuthLoading.set(false);
    }
  }

  async signInWithGoogle() {
    return this.authGateway.signInWithGoogle();
  }

  async signOut() {
    await this.authGateway.signOut();
    this.currentUser.set(null);
    this.router.navigate(['/entrar']);
  }

  async resetPassword(email: string) {
    return this.authGateway.resetPassword(email);
  }

  async updatePassword(password: string) {
    return this.authGateway.updatePassword(password);
  }

  handleUnauthorized() {
    this.currentUser.set(null);
    this.router.navigate(['/entrar']);
  }
}
