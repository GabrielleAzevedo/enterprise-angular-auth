import { UserMapper } from './user.mapper';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { describe, it, expect } from 'vitest';

describe('UserMapper', () => {
  it('deve retornar null se o usuário do Supabase for null', () => {
    const result = UserMapper.fromSupabase(null);
    expect(result).toBeNull();
  });

  it('deve mapear corretamente um usuário completo do Supabase', () => {
    const supabaseUser: SupabaseUser = {
      id: '123',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      email_confirmed_at: '2023-01-01T00:00:00Z',
      phone: '',
      confirmed_at: '2023-01-01T00:00:00Z',
      last_sign_in_at: '2023-01-01T00:00:00Z',
      app_metadata: { provider: 'email' },
      user_metadata: { full_name: 'Test User' },
      identities: [],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const result = UserMapper.fromSupabase(supabaseUser);

    expect(result).toEqual({
      id: '123',
      email: 'test@example.com',
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      user_metadata: { full_name: 'Test User' },
      app_metadata: { provider: 'email' },
    });
  });

  it('deve mapear corretamente mesmo sem metadados opcionais', () => {
    const supabaseUser: SupabaseUser = {
      id: '456',
      aud: 'authenticated',
      role: 'authenticated',
      email: undefined,
      phone: '',
      app_metadata: {},
      user_metadata: {},
      identities: [],
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    const result = UserMapper.fromSupabase(supabaseUser);

    expect(result).toEqual({
      id: '456',
      email: undefined,
      aud: 'authenticated',
      created_at: '2023-01-01T00:00:00Z',
      user_metadata: {},
      app_metadata: {},
    });
  });
});
