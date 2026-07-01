"use client";

import { useState } from "react";
import { Send, User, Mail, MessageSquare, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ContactFormData {
  company: string;
  name: string;
  email: string;
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    company: "",
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((p) => ({ ...p, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const validate = () => {
    const next: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.company.trim()) next.company = "Company name is required";
    if (!formData.name.trim()) next.name = "Contact name is required";
    if (!formData.email.trim()) next.email = "Work email is required";
    else {
      const re = /^\S+@\S+\.\S+$/;
      if (!re.test(formData.email)) next.email = "Enter a valid work email";
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const v = validate();
    if (Object.keys(v).length) {
      setErrors(v);
      return;
    }

    setIsLoading(true);

    try {
      if (!supabase) {
        setSubmitError("Contact is not configured. Please try again later.");
        setIsLoading(false);
        return;
      }

      const { error: sbError } = await supabase.from("contact_inquiries").insert([
        {
          company: formData.company,
          contact_name: formData.name,
          email: formData.email,
          message: formData.message,
        },
      ]);

      if (sbError) {
        setSubmitError("Something went wrong. Please try again.");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
      setIsLoading(false);
    }
  };

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
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-fadeIn">
          <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{submitError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="company" className="text-[10px] font-black uppercase tracking-widest text-content-secondary ml-2">Company Name</label>
          <div className="relative group">
            <Building2 size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-theme-primary transition-colors" />
            <input id="company" name="company" value={formData.company} onChange={handleInputChange} required className={`w-full pl-12 pr-6 py-3.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-sm text-content-primary placeholder:text-content-muted border-none transition-all font-medium focus-visible:ring-2 focus-visible:ring-theme-primary ${errors.company ? 'ring-1 ring-red-400' : ''}`} placeholder="Company, LLC" disabled={isLoading} />
            {errors.company && <p className="text-xs text-red-600 mt-1 pl-2">{errors.company}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-content-secondary ml-2">Contact Name</label>
          <div className="relative group">
            <User size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-theme-primary transition-colors" />
            <input id="name" name="name" value={formData.name} onChange={handleInputChange} required className={`w-full pl-12 pr-6 py-3.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-sm text-content-primary placeholder:text-content-muted border-none transition-all font-medium focus-visible:ring-2 focus-visible:ring-theme-primary ${errors.name ? 'ring-1 ring-red-400' : ''}`} placeholder="Jane Doe" disabled={isLoading} />
            {errors.name && <p className="text-xs text-red-600 mt-1 pl-2">{errors.name}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-content-secondary ml-2">Work Email</label>
        <div className="relative group">
          <Mail size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-content-muted group-focus-within:text-theme-primary transition-colors" />
          <input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className={`w-full pl-12 pr-6 py-3.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-sm text-content-primary placeholder:text-content-muted border-none transition-all font-medium focus-visible:ring-2 focus-visible:ring-theme-primary ${errors.email ? 'ring-1 ring-red-400' : ''}`} placeholder="you@company.com" disabled={isLoading} />
          {errors.email && <p className="text-xs text-red-600 mt-1 pl-2">{errors.email}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-content-secondary ml-2">Use case / Message (optional)</label>
        <div className="relative group">
          <MessageSquare size={16} className="absolute left-5 top-6 text-content-muted group-focus-within:text-theme-primary transition-colors" />
          <textarea id="message" name="message" rows={4} value={formData.message} onChange={handleInputChange} placeholder="Tell us about your integration, expected volume, or key requirements..." disabled={isLoading} className="w-full pl-12 pr-6 py-3.5 rounded-xl bg-bg-sunken shadow-neu-sunken-subtle text-sm text-content-primary placeholder:text-content-muted border-none transition-all font-medium resize-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-theme-primary" />
        </div>
      </div>

      <button type="submit" disabled={isLoading} className="btn-neumorphic-primary mt-2 w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Submitting...' : 'Contact Sales'}
        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
      </button>
    </form>
  );
}
