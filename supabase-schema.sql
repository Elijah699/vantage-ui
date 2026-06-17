-- ============================================================
-- VantageUI — Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- Order matters: tables first, then functions, then triggers,
-- then RLS policies.
-- ============================================================

-- 1. TABLES ---------------------------------------------------

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credits (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('granted', 'spent', 'purchased')),
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_created
  ON public.credit_transactions (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.extractions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  source_url TEXT,
  source_domain TEXT,
  element_tag TEXT,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  json_blueprint JSONB,
  generated_code TEXT,
  thumbnail_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_extractions_user_captured
  ON public.extractions (user_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. FUNCTION: handle_new_user --------------------------------

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);

  -- Grant 5 free credits
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 5);

  -- Record the grant transaction
  INSERT INTO public.credit_transactions (user_id, type, amount, description)
  VALUES (NEW.id, 'granted', 5, 'Welcome credits');

  RETURN NEW;
END;
$$;

-- 3. TRIGGER ---------------------------------------------------

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW-LEVEL SECURITY ----------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- users: users can read/update their own record
CREATE POLICY users_own ON public.users
  FOR ALL
  USING (auth.uid() = id);

-- credits: users can only read their own balance
CREATE POLICY credits_read_own ON public.credits
  FOR SELECT
  USING (auth.uid() = user_id);

-- credit_transactions: users can only read their own transactions
CREATE POLICY transactions_read_own ON public.credit_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- extractions: users have full CRUD on their own extractions
CREATE POLICY extractions_own ON public.extractions
  FOR ALL
  USING (auth.uid() = user_id);

-- waitlist: anyone can insert
CREATE POLICY waitlist_insert_public ON public.waitlist
  FOR INSERT
  WITH CHECK (true);

-- waitlist: only admin can select
CREATE POLICY waitlist_select_admin ON public.waitlist
  FOR SELECT
  USING (auth.jwt() ? 'is_admin' AND auth.jwt() ->> 'is_admin' = 'true');
