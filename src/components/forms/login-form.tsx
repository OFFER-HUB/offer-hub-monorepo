"use client"

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { ValidationMessage } from './validation-messages';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters long'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => void;
  onSocialAuth?: (method: 'apple' | 'google') => void;
  showSocialAuth?: boolean;
  disabled?: boolean;
  className?: string;
  backendError?: string | null;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onSocialAuth,
  showSocialAuth = true,
  disabled = false,
  className = "",
  backendError = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleFormSubmit = (data: LoginFormData) => {
    onSubmit(data);
  };

  const EyeIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {showSocialAuth && (
        <>
          <button
            onClick={() => onSocialAuth?.('apple')}
            disabled={disabled}
            className="w-full bg-black text-white py-3 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative"
          >
            <div className="absolute left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.1 22C7.79 22.05 6.8 20.68 5.96 19.47C4.25 17 2.94 12.45 4.7 9.39C5.57 7.87 7.13 6.91 8.82 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
              </svg>
            </div>
            Apple
          </button>
          <button
            onClick={() => onSocialAuth?.('google')}
            disabled={disabled}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-full font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative"
          >
            <div className="absolute left-4">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </div>
            Google
          </button>

          <div className="text-center text-gray-500 text-sm">Or</div>
        </>
      )}

      {backendError && (
        <ValidationMessage message={backendError} type="error" />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Email
                </FormLabel>
                <FormControl>
                  <input
                    type="email"
                    disabled={disabled}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                    placeholder="olivia@email.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      disabled={disabled}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-full focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                      placeholder="Enter your password"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={disabled}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={disabled || form.formState.isSubmitting}
            className="w-full bg-[#002333] text-white py-2 px-4 rounded-full font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#19213D] focus:ring-offset-2"
          >
            {form.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </Form>
    </div>
  );
};

export default LoginForm;