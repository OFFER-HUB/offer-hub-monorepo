"use client";

import React from "react";
import { ShieldCheck, Trash2, Download } from "lucide-react";
import { useDataRightsForm } from "@/hooks/use-data-rights-form";
import { Input } from "@/components/ui/Input";

const iconMap = {
  ShieldCheck,
  Trash2,
  Download,
};

export function DataRightsForm({
  title,
  description,
  iconName,
  endpoint,
  successMessage,
  buttonLabel,
  destructive,
}: {
  title: string;
  description: string;
  iconName: keyof typeof iconMap;
  endpoint: string;
  successMessage?: string;
  buttonLabel: string;
  destructive?: boolean;
}) {
  const { email, errors, status, loading, setEmail, handleSubmit } = useDataRightsForm(
    endpoint,
    successMessage
  );
  const Icon = iconMap[iconName] || ShieldCheck;

  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      <div className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated">
        <Icon size={24} className="text-theme-primary" />
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight mb-2 text-content-primary">{title}</h3>
        <p className="text-sm font-medium leading-relaxed text-content-secondary">{description}</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <Input
          id={`data-rights-email-${endpoint}`}
          label="Email address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          error={errors.email}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 ${
            destructive
              ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
              : "bg-theme-primary text-white hover:bg-theme-primary-hover shadow-lg"
          }`}
        >
          {loading ? "Processing…" : buttonLabel}
        </button>
        {status && (
          <p
            role="alert"
            className={`text-xs font-medium ${status.ok ? "text-theme-primary" : "text-red-500"}`}
          >
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
