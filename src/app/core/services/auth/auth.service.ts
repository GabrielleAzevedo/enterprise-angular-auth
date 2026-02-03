import { Injectable, inject } from '@angular/core';
import { AuthGateway } from '../../gateways/auth.gateway';
import { Router } from '@angular/router';
import { AuthState } from './auth.state';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authGateway = inject(AuthGateway);
  private authState = inject(AuthState);
  private router = inject(Router);

  // Expose state for compatibility (Facade Pattern)
  readonly currentUser = this.authState.currentUser;
  readonly currentSession = this.authState.session;
  readonly isAuthLoading = this.authState.isLoading;
  readonly accessToken = this.authState.accessToken;

  constructor() {
    // Sincroniza eventos externos (ex: abas diferentes, refresh automático do SDK) com a Store
    this.authGateway.onAuthStateChange((user, session) => {
      this.authState.setState(session);
    });
  }

  // Orchestration Methods

  async init() {
    // 1. Hidratação Otimista (Instantânea)
    this.authState.loadFromStorage();

    try {
      // 2. Validação/Atualização em Background
      const session = await this.authGateway.getSession();
      // Apenas atualiza se houver diferença ou para confirmar validade
      if (session) {
        this.authState.setState(session);
      } else {
        // Se o storage tinha algo mas o gateway diz que não tem sessão, limpa
        if (this.authState.isAuthenticated()) {
          this.authState.clearState();
        }
      }
    } catch (error) {
      this.authState.clearState();
    } finally {
      this.authState.setLoading(false);
    }
  }

  async signUp(email: string, password: string) {
    return this.authGateway.signUp(email, password);
  }

  async signInWithEmail(email: string, password: string) {
    const response = await this.authGateway.signInWithEmail(email, password);
    // O estado será atualizado automaticamente via onAuthStateChange,
    // mas em alguns casos pode ser útil forçar atualização aqui se o SDK não emitir imediatamente
    return response;
  }

  async signInWithGoogle() {
    return this.authGateway.signInWithGoogle();
  }

  async signOut() {
    await this.authGateway.signOut();
    this.authState.clearState();
    this.router.navigate(['/entrar']);
  }

  async refreshSession() {
    // Não alteramos o loading global para evitar flickers na UI durante refresh silencioso
    try {
      const session = await this.authGateway.getSession();
      if (!session) throw new Error('Session expired');

      this.authState.setState(session);
      return session;
    } catch (error) {
      this.authState.clearState();
      throw error;
    }
  }

  async resetPassword(email: string) {
    return this.authGateway.resetPasswordForEmail(email);
  }

  async updatePassword(password: string) {
    return this.authGateway.updatePassword(password);
  }

  handleUnauthorized() {
    this.authState.clearState();
    this.router.navigate(['/entrar']);
  }
}
