"use client"

import React from 'react';
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
import { CreateUserDTO } from '@/types/user.types';

const registerSchema = z.object({
  wallet_address: z
    .string()
    .min(1, 'Wallet address is required'),
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters long')
    .max(30, 'Username must be no more than 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z
    .string()
    .max(100, 'Name must be no more than 100 characters')
    .optional(),
  email: z
    .string()
    .email('Please enter a valid email address')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio must be no more than 500 characters')
    .optional(),
  is_freelancer: z.boolean().default(false),
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  walletAddress?: string | null;
  onSubmit: (data: CreateUserDTO) => void;
  disabled?: boolean;
  isSubmitting?: boolean;
  className?: string;
  backendError?: string | null;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  walletAddress,
  onSubmit,
  disabled = false,
  isSubmitting = false,
  className = "",
  backendError = null,
}) => {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      wallet_address: walletAddress || '',
      username: '',
      name: '',
      email: '',
      bio: '',
      is_freelancer: false,
    },
  });

  const handleFormSubmit = (data: RegisterFormData) => {
    const payload: CreateUserDTO = {
      wallet_address: data.wallet_address,
      username: data.username.trim(),
      name: data.name?.trim() || undefined,
      bio: data.bio?.trim() || undefined,
      email: data.email?.trim() || undefined,
      is_freelancer: data.is_freelancer,
    };
    onSubmit(payload);
  };

  React.useEffect(() => {
    if (walletAddress) {
      form.setValue('wallet_address', walletAddress);
    }
  }, [walletAddress, form]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center text-gray-500 text-sm mb-4">Create an account</div>

      {backendError && (
        <ValidationMessage message={backendError} type="error" />
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="wallet_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Wallet address
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-200 rounded-md bg-gray-50 text-[#667085]"
                    placeholder="Connect your wallet first"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
                {!walletAddress && (
                  <ValidationMessage message="Wallet connection required" type="error" />
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Username
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    disabled={disabled || isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                    placeholder="yourusername"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Name
                </FormLabel>
                <FormControl>
                  <input
                    type="text"
                    disabled={disabled || isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                    placeholder="John Doe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Bio
                </FormLabel>
                <FormControl>
                  <textarea
                    disabled={disabled || isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                    placeholder="Tell us about yourself"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="block text-sm font-medium text-[#344054] mb-2">
                  Email (optional)
                </FormLabel>
                <FormControl>
                  <input
                    type="email"
                    disabled={disabled || isSubmitting}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-[#19213D] focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed text-[#667085]"
                    placeholder="you@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_freelancer"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormControl>
                    <input
                      id="isFreelancer"
                      type="checkbox"
                      disabled={disabled || isSubmitting}
                      className="h-4 w-4"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="isFreelancer" className="text-sm text-[#344054]">
                    I am a freelancer
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <button
            type="submit"
            disabled={disabled || isSubmitting || !walletAddress || !form.formState.isValid}
            className="w-full bg-[#149A9B] text-white py-2 px-4 rounded-full font-medium hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#149A9B] focus:ring-offset-2 flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin -ml-1 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </Form>
    </div>
  );
};

export default RegisterForm;