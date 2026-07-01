"use client";

import React, { useState } from "react";
import { ShieldCheck, Trash2, Download } from "lucide-react";

const iconMap = {
  ShieldCheck,
  Trash2,
  Download,
};

type RequestStatus = { ok: boolean; message: string } | null;

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
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<RequestStatus>(null);
  const [loading, setLoading] = useState(false);
  const Icon = iconMap[iconName] || ShieldCheck;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus({ ok: false, message: json.error ?? "An error occurred." });
      } else {
        setStatus({ ok: true, message: successMessage ?? json.message ?? "Done." });
        setEmail("");
      }
    } catch {
      setStatus({ ok: false, message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 sm:p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-6">
      <div className="w-14 h-14 rounded-2xl shadow-neu-sunken-subtle flex items-center justify-center shrink-0 bg-bg-elevated">
        <Icon size={24} className="text-theme-primary" />
      </div>
      <div>
        <h3 className="text-xl font-black tracking-tight mb-2 text-content-primary">{title}</h3>
        <p className="text-sm font-medium leading-relaxed text-content-secondary">{description}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="rounded-xl px-4 py-3 text-sm bg-bg-sunken shadow-neu-sunken-subtle text-content-primary placeholder:text-content-secondary/60 outline-none focus:ring-2 focus:ring-theme-primary/30 transition-all"
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
          <p className={`text-xs font-medium ${status.ok ? "text-theme-primary" : "text-red-500"}`}>
            {status.message}
          </p>
        )}
      </form>
    </div>
  );
}
