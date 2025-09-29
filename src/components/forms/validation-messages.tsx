"use client"

import React from 'react';
import { cn } from '@/lib/utils';

interface ValidationMessageProps {
  message?: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  message,
  type = 'error',
  className,
}) => {
  if (!message) return null;

  const baseStyles = "text-sm font-medium mt-1 flex items-center gap-1";
  const typeStyles = {
    error: "text-red-600",
    warning: "text-yellow-600",
    info: "text-blue-600"
  };

  const Icon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(baseStyles, typeStyles[type], className)}>
      <Icon />
      <span>{message}</span>
    </div>
  );
};

interface ValidationMessagesProps {
  messages: string[];
  type?: 'error' | 'warning' | 'info';
  className?: string;
}

export const ValidationMessages: React.FC<ValidationMessagesProps> = ({
  messages,
  type = 'error',
  className,
}) => {
  if (!messages || messages.length === 0) return null;

  return (
    <div className={cn("space-y-1", className)}>
      {messages.map((message, index) => (
        <ValidationMessage
          key={index}
          message={message}
          type={type}
        />
      ))}
    </div>
  );
};

export default ValidationMessage;