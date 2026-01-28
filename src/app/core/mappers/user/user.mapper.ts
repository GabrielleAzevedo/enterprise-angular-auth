import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../../models/user.model';

export class UserMapper {
  static fromSupabase(supabaseUser: SupabaseUser | null): User | null {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      aud: supabaseUser.aud,
      created_at: supabaseUser.created_at,
      user_metadata: supabaseUser.user_metadata,
      app_metadata: supabaseUser.app_metadata,
    };
  }
}
