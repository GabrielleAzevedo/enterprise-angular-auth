import { describe, it, expect } from 'vitest';
import { mapSupabaseErrorToDomain } from './supabase-error.mapper';
import { AuthErrorCode } from '../../models/auth-errors';

describe('SupabaseErrorMapper', () => {
  it('deve mapear "Email not confirmed" para AuthErrorCode.EmailNotConfirmed', () => {
    const error = { message: 'Email not confirmed', status: 400 };
    const result = mapSupabaseErrorToDomain(error);
    expect(result.code).toBe(AuthErrorCode.EmailNotConfirmed);
  });

  it('deve mapear "Invalid login credentials" para AuthErrorCode.InvalidCredentials', () => {
    const error = { message: 'Invalid login credentials', status: 400 };
    const result = mapSupabaseErrorToDomain(error);
    expect(result.code).toBe(AuthErrorCode.InvalidCredentials);
  });

  it('deve mapear "already registered" para AuthErrorCode.UserAlreadyRegistered', () => {
    const error = { message: 'User already registered', status: 422 };
    const result = mapSupabaseErrorToDomain(error);
    expect(result.code).toBe(AuthErrorCode.UserAlreadyRegistered);
  });

  it('deve mapear status 0 para AuthErrorCode.NetworkError', () => {
    const error = { status: 0, message: 'Failed to fetch' };
    const result = mapSupabaseErrorToDomain(error);
    expect(result.code).toBe(AuthErrorCode.NetworkError);
  });

  it('deve mapear erro desconhecido para AuthErrorCode.Unknown', () => {
    const error = { message: 'Algum erro bizarro do banco' };
    const result = mapSupabaseErrorToDomain(error);
    expect(result.code).toBe(AuthErrorCode.Unknown);
    expect(result.message).toBe('Algum erro bizarro do banco');
  });
});
