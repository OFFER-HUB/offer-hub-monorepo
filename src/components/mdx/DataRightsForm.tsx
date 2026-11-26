"use client";

import React from "react";
import { ShieldCheck, Trash2, Download } from "lucide-react";
import { useDataRightsForm } from "@/hooks/use-data-rights-form";
import { Field } from "@/components/ui/Field";
import { Callout } from "@/components/docs/Callout";
import { Button } from "@/components/ui/Button";

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
    <div className="p-8 sm:p-10 rounded-3xl bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      <div className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated">
        <Icon size={24} className="text-theme-primary" />
      </div>
      <div>
        <h3 className="text-xl font-semibold tracking-tight mb-2 text-content-primary">{title}</h3>
        <p className="text-sm font-medium leading-relaxed text-content-secondary">{description}</p>
      </div>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <Field
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
        <Button
          type="submit"
          disabled={loading}
          loading={loading}
          variant={destructive ? "danger" : "primary"}
          className="w-full"
        >
          {loading ? "Processing…" : buttonLabel}
        </Button>
        {status && (
          <Callout
            tone={status.ok ? "tip" : "danger"}
            role="alert"
            label={status.ok ? "Request received" : "Request failed"}
            className="my-0 text-xs font-medium"
          >
            {status.message}
          </Callout>
        )}
      </form>
    </div>
  );
}
