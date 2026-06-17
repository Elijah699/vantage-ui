import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { AuthResponse, ApiError } from '@/lib/types/api';
import { createServerClient } from '@/lib/supabase/server';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid request body', code: 'validation_error' } satisfies ApiError,
      { status: 400 },
    );
  }

  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      {
        error: firstIssue?.message ?? 'Validation error',
        code: 'validation_error',
      } satisfies ApiError,
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    if (error.message.includes('already registered')) {
      return NextResponse.json(
        {
          error: 'This email is already registered. Please sign in instead.',
          code: 'validation_error',
        } satisfies ApiError,
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: error.message, code: 'validation_error' } satisfies ApiError,
      { status: 400 },
    );
  }

  if (!data.user || !data.session) {
    return NextResponse.json(
      { error: 'Signup failed. Please try again.', code: 'validation_error' } satisfies ApiError,
      { status: 400 },
    );
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email ?? '' },
    session: { access_token: data.session.access_token, expires_at: data.session.expires_at ?? 0 },
  } satisfies AuthResponse);
}
