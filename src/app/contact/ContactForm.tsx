"use client";

import { Send, User, Mail, MessageSquare, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { FormField } from "@/components/forms/FormField";
import { useContactForm } from "@/hooks/use-contact-form";

export function ContactForm() {
  const {
    formData,
    errors,
    isLoading,
    isSubmitted,
    submitError,
    handleInputChange,
    handleSubmit,
  } = useContactForm();

  if (isSubmitted) {
    return (
      <div className="py-24 bg-transparent flex flex-col items-center justify-center text-center px-6">
        <div className="w-20 h-20 rounded-3xl bg-bg-elevated shadow-neu-raised flex items-center justify-center mb-8 animate-fadeInScale">
          <CheckCircle2 size={40} className="text-theme-primary" />
        </div>
        <h2 className="text-3xl font-black text-content-primary tracking-tight mb-4">Thanks — we&apos;ll be in touch</h2>
        <p className="text-content-secondary max-w-sm font-medium">A member of our enterprise team will reach out to you shortly to discuss your inquiry.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      {submitError && (
        <div role="alert" aria-live="assertive" className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-fadeIn">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          id="company"
          name="company"
          label="Company Name"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Company, LLC"
          required
          disabled={isLoading}
          icon={Building2}
          error={errors.company}
        />

        <FormField
          id="name"
          name="name"
          label="Contact Name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Jane Doe"
          required
          disabled={isLoading}
          icon={User}
          error={errors.name}
        />
      </div>

      <FormField
        id="email"
        name="email"
        label="Work Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="you@company.com"
        required
        disabled={isLoading}
        icon={Mail}
        error={errors.email}
      />

      <FormField
        id="message"
        name="message"
        label="Use case / Message (optional)"
        as="textarea"
        rows={4}
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Tell us about your integration, expected volume, or key requirements..."
        disabled={isLoading}
        icon={MessageSquare}
      />

      <button type="submit" disabled={isLoading} className="btn-neumorphic-primary mt-2 w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Submitting...' : 'Contact Sales'}
        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    </form>
  );
}
