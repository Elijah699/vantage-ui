import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, toast } from '@vantage-ui/ui';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { LoginFormData } from '../../schemas/auth.schema';
import { loginSchema } from '../../schemas/auth.schema';
import { usePopupStore } from '../../store/popup-store';

interface LoginFormProps {
  onSwitchToSignup: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const login = usePopupStore((s) => s.login);
  const authState = usePopupStore((s) => s.authState);
  const error = usePopupStore((s) => s.error);
  const isLoading = authState === 'loading';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    await login(data.email, data.password);
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-level-2">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold font-display text-gray-900 mb-1">
          Welcome back
        </h2>
        <p className="text-sm font-body text-gray-500">
          Sign in to your VantageUI account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-gray-700 font-body"
          >
            Email
          </label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="font-body bg-white border-gray-200 focus-visible:ring-[#2B5CE6]"
          />
          {errors.email && (
            <p className="text-destructive text-xs font-body mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label
              htmlFor="login-password"
              className="text-sm font-medium text-gray-700 font-body"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => toast({ title: 'Password reset coming soon.' })}
              className="text-xs text-[#2B5CE6] hover:underline font-body"
            >
              Forgot password?
            </button>
          </div>
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="font-body bg-white border-gray-200 focus-visible:ring-[#2B5CE6]"
          />
          {errors.password && (
            <p className="text-destructive text-xs font-body mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {error && <p className="text-destructive text-sm font-body">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#2B5CE6] hover:bg-[#1E43B5] text-white font-body"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm font-body text-gray-500">
        Don&apos;t have an account?
        {' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-[#2B5CE6] font-medium hover:underline"
        >
          Create one
        </button>
      </div>
    </div>
  );
}
