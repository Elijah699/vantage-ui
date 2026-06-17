import { NextResponse } from 'next/server';

import { requireAuth, unauthorizedResponse } from '@/lib/auth/middleware';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const auth = await requireAuth(request);
  if (auth.error) return unauthorizedResponse();

  const supabase = await createServerClient();
  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}
