import { NextResponse } from 'next/server';
import type { AuthErrorResponse } from '../types/api';
import { createServerClient } from '../supabase/server';

interface AuthResult {
  user: { id: string; email: string };
  error: null;
}
interface AuthError {
  user: null;
  error: AuthErrorResponse & { status: number };
}

export type RequireAuthResult = AuthResult | AuthError;

export async function requireAuth(request: Request): Promise<RequireAuthResult> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: {
        error: 'Unauthorized',
        code: 'unauthorized',
        status: 401,
      },
    };
  }

  const token = authHeader.slice(7);

  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return {
      user: null,
      error: {
        error: 'Unauthorized',
        code: 'unauthorized',
        status: 401,
      },
    };
  }

  return {
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
    },
    error: null,
  };
}

export function unauthorizedResponse(): NextResponse<AuthErrorResponse> {
  return NextResponse.json({ error: 'Unauthorized', code: 'unauthorized' }, { status: 401 });
}
