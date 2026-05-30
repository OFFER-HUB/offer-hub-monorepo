"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

interface WithdrawalFormProps {
  availableBalance: number;
  onSuccess: (tx: {
    id: string;
    amount: string;
    destination: string;
    destinationType: "stellar" | "airtm";
    status: "WITHDRAWAL_PENDING";
    createdAt: string;
  }) => void;
  onCancel: () => void;
}

type DestinationType = "stellar" | "airtm";

export function WithdrawalForm({ availableBalance, onSuccess, onCancel }: WithdrawalFormProps) {
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [destinationType, setDestinationType] = useState<DestinationType>("stellar");
  const [errors, setErrors] = useState<{ amount?: string; destination?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { amount?: string; destination?: string } = {};
    const numAmount = parseFloat(amount);

    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = "Please enter a valid amount greater than 0.";
    } else if (numAmount < 1) {
      newErrors.amount = "Minimum withdrawal is $1.00 USDC.";
    } else if (numAmount > availableBalance) {
      newErrors.amount = `Amount exceeds your available balance of $${availableBalance.toFixed(2)} USDC.`;
    }

    if (!destination.trim()) {
      newErrors.destination = destinationType === "stellar"
        ? "Please enter a valid Stellar address."
        : "Please enter a valid AirTM email address.";
    } else if (destinationType === "stellar" && !/^G[A-Z2-7]{55}$/.test(destination.trim())) {
      newErrors.destination = "Invalid Stellar address. Must start with G and be 56 characters.";
    } else if (destinationType === "airtm" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(destination.trim())) {
      newErrors.destination = "Invalid AirTM email address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const tx = {
      id: `wd_${Math.random().toString(36).slice(2, 10)}`,
      amount: parseFloat(amount).toFixed(2),
      destination: destination.trim(),
      destinationType,
      status: "WITHDRAWAL_PENDING" as const,
      createdAt: new Date().toISOString(),
    };
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => { onSuccess(tx); }, 1500);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Withdrawal Submitted!</h3>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Your withdrawal request is being processed. It will appear in your transaction history as <strong>Pending</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          Withdrawal Method
        </label>
        <div className="flex gap-2">
          {(["stellar", "airtm"] as DestinationType[]).map((type) => (
            <button key={type} type="button"
              onClick={() => { setDestinationType(type); setDestination(""); setErrors({}); }}
              className={cn("flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all",
                destinationType === type
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-bg-sunken)] hover:border-[var(--color-primary)]"
              )}>
              {type === "stellar" ? "🌐 Stellar USDC" : "💳 AirTM Fiat"}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="withdrawal-amount" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          Amount (USDC)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] font-mono text-sm">$</span>
          <input id="withdrawal-amount" type="number" min="1" step="0.01" max={availableBalance} value={amount}
            onChange={(e) => { setAmount(e.target.value); if (errors.amount) setErrors((p) => ({ ...p, amount: undefined })); }}
            placeholder="0.00"
            className={cn("w-full pl-7 pr-24 py-3 rounded-lg border bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] font-mono text-sm focus:outline-none focus:ring-2 transition-all",
              errors.amount ? "border-red-500 focus:ring-red-500/20" : "border-[var(--color-bg-sunken)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]")} />
          <button type="button" onClick={() => setAmount(availableBalance.toFixed(2))}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-1 rounded font-semibold hover:bg-[var(--color-primary)]/20 transition-colors">
            MAX
          </button>
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.amount}
          </p>
        )}
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Available: <span className="font-semibold text-[var(--color-primary)]">${availableBalance.toFixed(2)} USDC</span>
        </p>
      </div>

      <div>
        <label htmlFor="withdrawal-destination" className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)] mb-2">
          {destinationType === "stellar" ? "Destination Stellar Address" : "AirTM Email Address"}
        </label>
        <input id="withdrawal-destination" type={destinationType === "airtm" ? "email" : "text"} value={destination}
          onChange={(e) => { setDestination(e.target.value); if (errors.destination) setErrors((p) => ({ ...p, destination: undefined })); }}
          placeholder={destinationType === "stellar" ? "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" : "user@example.com"}
          className={cn("w-full px-3 py-3 rounded-lg border bg-[var(--color-bg-sunken)] text-[var(--color-text-primary)] font-mono text-sm focus:outline-none focus:ring-2 transition-all",
            errors.destination ? "border-red-500 focus:ring-red-500/20" : "border-[var(--color-bg-sunken)] focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]")} />
        {errors.destination && (
          <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.destination}
          </p>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex gap-2 text-xs text-amber-800 dark:text-amber-300">
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>Please double-check the destination address. Withdrawals are irreversible once processed.</span>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3 rounded-lg border border-[var(--color-bg-sunken)] text-[var(--color-text-secondary)] text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-3 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:bg-[var(--color-primary-hover)] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Processing...
            </>
          ) : "Submit Withdrawal"}
        </button>
      </div>
    </form>
  );
}