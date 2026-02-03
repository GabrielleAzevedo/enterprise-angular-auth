export enum AuthErrorCode {
  EmailNotConfirmed = 'email_not_confirmed',
  InvalidCredentials = 'invalid_credentials',
  UserAlreadyRegistered = 'user_already_registered',
  NetworkError = 'network_error',
  Unknown = 'unknown',
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message: string,
    public originalError?: any,
  ) {
    super(message);
    this.name = 'AuthError';
  }

  toUserFriendlyMessage(): string {
    switch (this.code) {
      case AuthErrorCode.EmailNotConfirmed:
        return 'Email não confirmado. Verifique sua caixa de entrada.';
      case AuthErrorCode.InvalidCredentials:
        return 'Email ou senha incorretos.';
      case AuthErrorCode.UserAlreadyRegistered:
        return 'Este email já está em uso.';
      case AuthErrorCode.NetworkError:
        return 'Erro de conexão. Verifique sua internet.';
      case AuthErrorCode.Unknown:
      default:
        return 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }
}
