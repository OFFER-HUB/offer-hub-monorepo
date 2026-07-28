"use client";

import { useState } from "react";
import { submitContactInquiry } from "@/services/contact";

export interface ContactFormData {
  company: string;
  name: string;
  email: string;
  message: string;
}

const INITIAL_FORM_DATA: ContactFormData = {
  company: "",
  name: "",
  email: "",
  message: "",
};

const ERROR_MESSAGES = {
  not_configured: "Contact is not configured. Please try again later.",
  error: "Something went wrong. Please try again.",
  network: "Network error. Please check your connection and try again.",
} as const;

function validateContactForm(formData: ContactFormData) {
  const next: Partial<Record<keyof ContactFormData, string>> = {};
  if (!formData.company.trim()) next.company = "Company name is required";
  if (!formData.name.trim()) next.name = "Contact name is required";
  if (!formData.email.trim()) next.email = "Work email is required";
  else {
    if (!isValidEmail(formData.email)) {
      next.email = "Enter a valid work email";
    }
  }
  return next;
}

export function useContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    const result = await submitContactInquiry({
      company: formData.company,
      name: formData.name,
      email: formData.email,
      message: formData.message,
    });

    if (result.ok) {
      setIsSubmitted(true);
      return;
    }

    setSubmitError(ERROR_MESSAGES[result.reason]);
    setIsLoading(false);
  };

  return {
    formData,
    errors,
    isLoading,
    isSubmitted,
    submitError,
    handleInputChange,
    handleSubmit,
  };
}
