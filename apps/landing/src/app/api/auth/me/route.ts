import { NextResponse } from 'next/server';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/middleware';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return unauthorizedResponse();

  const admin = createAdminClient();

  const { data: user } = await admin
    .from('users')
    .select('id, email, created_at')
    .eq('id', auth.user.id)
    .single();

  const { data: credits } = await admin
    .from('credits')
    .select('balance')
    .eq('user_id', auth.user.id)
    .single();

  return NextResponse.json({
    user: {
      id: auth.user.id,
      email: auth.user.email,
      created_at: user?.created_at ?? null,
    },
    credits: {
      balance: credits?.balance ?? 0,
    },
  });
}
