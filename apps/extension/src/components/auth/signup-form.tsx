import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, toast } from '@vantage-ui/ui';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';

import type { SignupFormData } from '../../schemas/auth.schema';
import { signupSchema } from '../../schemas/auth.schema';
import { usePopupStore } from '../../store/popup-store';

interface SignupFormProps {
  onSwitchToLogin: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const signup = usePopupStore((s) => s.signup);
  const authState = usePopupStore((s) => s.authState);
  const error = usePopupStore((s) => s.error);
  const isLoading = authState === 'loading';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    await signup(data.email, data.password);
    if (usePopupStore.getState().authState === 'authenticated') {
      toast({
        title: 'Welcome! 5 free credits added to your account.',
        description: "You're all set to start using VantageUI.",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-level-2">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold font-display text-gray-900 mb-1">
          Create your account
        </h2>
        <p className="text-sm font-body text-gray-500">
          5 free credits included on sign-up.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="signup-email"
            className="text-sm font-medium text-gray-700 font-body"
          >
            Email
          </label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            {...register('email')}
            className="font-body bg-white border-gray-200 focus-visible:ring-[#2B5CE6]"
          />
          {errors.email && (
            <p className="text-[#DC2626] text-xs font-body mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-password"
            className="text-sm font-medium text-gray-700 font-body"
          >
            Password
          </label>
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="font-body bg-white border-gray-200 focus-visible:ring-[#2B5CE6]"
          />
          {errors.password && (
            <p className="text-[#DC2626] text-xs font-body mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="signup-confirm"
            className="text-sm font-medium text-gray-700 font-body"
          >
            Confirm Password
          </label>
          <Input
            id="signup-confirm"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            className="font-body bg-white border-gray-200 focus-visible:ring-[#2B5CE6]"
          />
          {errors.confirmPassword && (
            <p className="text-[#DC2626] text-xs font-body mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && <p className="text-[#DC2626] text-sm font-body">{error}</p>}

        <Button
          type="submit"
          className="w-full bg-[#2B5CE6] hover:bg-[#1E43B5] text-white font-body mt-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm font-body text-gray-500">
        Already have an account?
        {' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#2B5CE6] font-medium hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
