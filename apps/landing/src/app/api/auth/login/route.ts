import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { AuthResponse, ApiError } from '@/lib/types/api';
import { createServerClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json(
      { error: 'Invalid request body', code: 'validation_error' } satisfies ApiError,
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid email or password', code: 'validation_error' } satisfies ApiError,
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json(
      { error: 'Invalid email or password', code: 'unauthorized' } satisfies ApiError,
      { status: 401 },
    );
  }

  if (!data.user || !data.session) {
    return NextResponse.json(
      { error: 'Invalid email or password', code: 'unauthorized' } satisfies ApiError,
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: { id: data.user.id, email: data.user.email ?? '' },
    session: { access_token: data.session.access_token, expires_at: data.session.expires_at ?? 0 },
  } satisfies AuthResponse);
}
