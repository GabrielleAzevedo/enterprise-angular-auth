import { Injectable, computed, signal, inject } from '@angular/core';
import { AuthSession, User } from '../../models/user.model';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthState {
  private storage = inject(StorageService);

  // Estado interno privado para garantir imutabilidade externa direta
  private readonly _currentUser = signal<User | null>(null);
  private readonly _session = signal<AuthSession | null>(null);
  private readonly _isLoading = signal<boolean>(true);

  // Seletores públicos (Read-only Signals)
  readonly currentUser = this._currentUser.asReadonly();
  readonly session = this._session.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly accessToken = computed(() => this._session()?.access_token || null);

  // Actions (Mutações de Estado)
  setState(session: AuthSession | null) {
    this._session.set(session);
    this._currentUser.set(session?.user || null);
    this._isLoading.set(false);
    this.saveToStorage(session);
  }

  setLoading(isLoading: boolean) {
    this._isLoading.set(isLoading);
  }

  clearState() {
    this._session.set(null);
    this._currentUser.set(null);
    this._isLoading.set(false);
    this.storage.removeItem('auth_session');
  }

  loadFromStorage(): boolean {
    const stored = this.storage.getItem('auth_session');
    if (stored) {
      try {
        const session = JSON.parse(stored);
        this._session.set(session);
        this._currentUser.set(session?.user || null);
        this._isLoading.set(false);
        return true;
      } catch {
        this.storage.removeItem('auth_session');
      }
    }
    return false;
  }

  private saveToStorage(session: AuthSession | null) {
    if (session) {
      this.storage.setItem('auth_session', JSON.stringify(session));
    } else {
      this.storage.removeItem('auth_session');
    }
  }
}
