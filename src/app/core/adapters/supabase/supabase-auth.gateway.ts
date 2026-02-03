import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AuthGateway } from '../../gateways/auth.gateway';
import { environment } from '../../../../environments/environment';
import { User, AuthSession } from '../../models/user.model';
import { UserMapper } from '../../mappers/user/user.mapper';
import { mapSupabaseErrorToDomain } from './supabase-error.mapper';

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
    const session = data.session;

    if (!session) return null;

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_in: session.expires_in,
      token_type: session.token_type,
      user: UserMapper.fromSupabase(session.user),
    };
  }

  onAuthStateChange(callback: (user: User | null, session: AuthSession | null) => void): void {
    this.supabase.auth.onAuthStateChange((event, session) => {
      const authSession: AuthSession | null = session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_in: session.expires_in,
            token_type: session.token_type,
            user: UserMapper.fromSupabase(session.user),
          }
        : null;

      callback(UserMapper.fromSupabase(session?.user || null), authSession);
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
    const { error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/entrar`,
      },
    });

    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/definir-nova-senha`,
    });

    if (error) {
      this.handleSupabaseError(error);
    }
  }

  async updatePassword(password: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      this.handleSupabaseError(error);
    }
  }

  private handleSupabaseError(error: any): never {
    throw mapSupabaseErrorToDomain(error);
  }
}
