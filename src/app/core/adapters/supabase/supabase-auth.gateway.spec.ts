import { TestBed } from '@angular/core/testing';
import { SupabaseAuthGateway } from './supabase-auth.gateway';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AuthErrorCode } from '../../models/auth-errors';

// Mock simples para permitir a construção do serviço
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  })),
}));

describe('SupabaseAuthGateway', () => {
  let gateway: SupabaseAuthGateway;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SupabaseAuthGateway],
    });
    gateway = TestBed.inject(SupabaseAuthGateway);
  });

  describe('Tratamento de Erros (handleSupabaseError)', () => {
    // Helper para acessar o método privado
    const handleError = (error: any) => {
      try {
        (gateway as any).handleSupabaseError(error);
      } catch (e) {
        return Promise.reject(e);
      }
      return Promise.resolve();
    };

    it('deve lançar EmailNotConfirmed quando a mensagem contiver "Email not confirmed"', async () => {
      const error = { message: 'Email not confirmed', status: 400 };
      await expect(handleError(error)).rejects.toMatchObject({
        code: AuthErrorCode.EmailNotConfirmed,
      });
    });

    it('deve lançar InvalidCredentials quando a mensagem contiver "Invalid login credentials"', async () => {
      const error = { message: 'Invalid login credentials', status: 400 };
      await expect(handleError(error)).rejects.toMatchObject({
        code: AuthErrorCode.InvalidCredentials,
      });
    });

    it('deve lançar UserAlreadyRegistered quando a mensagem contiver "already registered"', async () => {
      const error = { message: 'User already registered', status: 422 };
      await expect(handleError(error)).rejects.toMatchObject({
        code: AuthErrorCode.UserAlreadyRegistered,
      });
    });

    it('deve lançar NetworkError quando status for 0', async () => {
      const error = { status: 0, message: 'Failed to fetch' };
      await expect(handleError(error)).rejects.toMatchObject({
        code: AuthErrorCode.NetworkError,
      });
    });

    it('deve lançar Unknown para erros genéricos', async () => {
      const error = { message: 'Algum erro bizarro do banco' };
      await expect(handleError(error)).rejects.toMatchObject({
        code: AuthErrorCode.Unknown,
        message: 'Algum erro bizarro do banco',
      });
    });
  });
});
