import { User, AuthSession } from '../models/user.model';

export abstract class AuthGateway {
  abstract getCurrentUser(): Promise<User | null>;
  abstract getSession(): Promise<AuthSession | null>;
  abstract onAuthStateChange(
    callback: (user: User | null, session: AuthSession | null) => void,
  ): void;
  abstract signUp(email: string, password: string): Promise<void>;
  abstract signInWithEmail(email: string, password: string): Promise<void>;
  abstract signInWithGoogle(): Promise<void>;
  abstract signOut(): Promise<void>;
  abstract resetPasswordForEmail(email: string): Promise<void>;
  abstract updatePassword(password: string): Promise<void>;
}
