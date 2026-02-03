import { AuthError, AuthErrorCode } from '../../models/auth-errors';

export function mapSupabaseErrorToDomain(error: any): AuthError {
  const message = error?.message || '';
  const status = error?.status;

  // Tentativa de mapeamento por status code ou código interno, evitando "stringly typed" puro
  if (status === 400 || status === 422) {
    if (message.includes('Email not confirmed')) {
      return new AuthError(AuthErrorCode.EmailNotConfirmed, 'Email não confirmado.', error);
    }
    if (message.includes('Invalid login credentials')) {
      return new AuthError(AuthErrorCode.InvalidCredentials, 'Credenciais inválidas.', error);
    }
    if (message.includes('already registered')) {
      return new AuthError(AuthErrorCode.UserAlreadyRegistered, 'Usuário já cadastrado.', error);
    }
  }

  // Erro de rede genérico do Supabase/Fetch
  if (error?.status === 0 || message.includes('Failed to fetch')) {
    return new AuthError(AuthErrorCode.NetworkError, 'Erro de conexão.', error);
  }

  return new AuthError(AuthErrorCode.Unknown, message || 'Erro desconhecido', error);
}
