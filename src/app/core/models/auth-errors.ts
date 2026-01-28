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
}