"use client";

import { Send, User, Mail, MessageSquare, Building2, CheckCircle2 } from "lucide-react";
import { Field } from "@/components/ui/Field";
import { Callout } from "@/components/docs/Callout";
import { HoneypotField } from "@/components/forms/HoneypotField";
import { useContactForm } from "@/hooks/use-contact-form";
import { Button } from "@/components/ui/Button";

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
          <CheckCircle2 size={40} aria-hidden="true" className="text-theme-success" />
        </div>
        <h2 className="text-3xl font-bold text-content-primary tracking-tight mb-4">Thanks — we&apos;ll be in touch</h2>
        <p className="text-content-secondary max-w-sm font-medium">A member of our enterprise team will reach out to you shortly to discuss your inquiry.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 rounded-3xl bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      <HoneypotField id="contact-website" value={formData.website ?? ""} onChange={handleInputChange} />
      {submitError && (
        <Callout tone="danger" role="alert" label="Submission error" className="my-0 animate-fadeIn">
          {submitError}
        </Callout>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          id="company"
          name="company"
          label="Company Name"
          value={formData.company}
          onChange={handleInputChange}
          placeholder="Company, LLC"
          required
          disabled={isLoading}
          leadingIcon={<Building2 size={16} />}
          error={errors.company}
        />

        <Field
          id="name"
          name="name"
          label="Contact Name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Jane Doe"
          required
          disabled={isLoading}
          leadingIcon={<User size={16} />}
          error={errors.name}
        />
      </div>

      <Field
        id="email"
        name="email"
        label="Work Email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="you@company.com"
        required
        disabled={isLoading}
        leadingIcon={<Mail size={16} />}
        error={errors.email}
      />

      <Field
        id="message"
        name="message"
        label="Use case / Message (optional)"
        as="textarea"
        rows={4}
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Tell us about your integration, expected volume, or key requirements..."
        disabled={isLoading}
        leadingIcon={<MessageSquare size={16} />}
      />

      <Button type="submit" disabled={isLoading} loading={isLoading} className="mt-2 w-full">
        {isLoading ? "Submitting..." : "Contact Sales"}
        <Send size={14} aria-hidden="true" />
      </Button>
    </form>
  );
}
