import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthGateway } from '../../gateways/auth.gateway';
import { environment } from '../../../../environments/environment.example';
import { User, AuthSession } from '../../models/user.model';
import { UserMapper } from '../../mappers/user/user.mapper';
import { AuthError, AuthErrorCode } from '../../models/auth-errors';

@Injectable({
  providedIn: 'root',
})
export class SupabaseAuthGateway extends AuthGateway {
  private supabase: SupabaseClient;

  constructor() {
    super();
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return UserMapper.fromSupabase(data.user);
  }

  async getSession(): Promise<AuthSession | null> {
    const { data } = await this.supabase.auth.getSession();
    if (!data.session) return null;

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: UserMapper.fromSupabase(data.session.user),
    };
  }

  onAuthStateChange(callback: (user: User | null) => void): void {
    this.supabase.auth.onAuthStateChange((event, session) => {
      callback(UserMapper.fromSupabase(session?.user || null));
    });
  }

  async signUp(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async signInWithGoogle(): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/entrar`,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      this.handleSupabaseError(error);
    }

    if (data?.url) {
      window.location.href = data.url;
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/atualizar-senha`,
    });
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password,
    });
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  private handleSupabaseError(error: any): never {
    const message = error?.message || '';

    if (message.includes('Email not confirmed')) {
      throw new AuthError(AuthErrorCode.EmailNotConfirmed, 'Email não confirmado.', error);
    }
    if (message.includes('Invalid login credentials')) {
      throw new AuthError(AuthErrorCode.InvalidCredentials, 'Credenciais inválidas.', error);
    }
    if (message.includes('already registered')) {
      throw new AuthError(AuthErrorCode.UserAlreadyRegistered, 'Usuário já cadastrado.', error);
    }

    // Erro de rede genérico do Supabase/Fetch
    if (error?.status === 0 || message.includes('Failed to fetch')) {
      throw new AuthError(AuthErrorCode.NetworkError, 'Erro de conexão.', error);
    }

    throw new AuthError(AuthErrorCode.Unknown, message || 'Erro desconhecido', error);
  }
}