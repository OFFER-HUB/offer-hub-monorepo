"use client";

import Script from "next/script";
import { Send, User, Mail, MessageSquare, CheckCircle2, AlertCircle, Timer } from "lucide-react";
import { FormField } from "@/components/forms/FormField";
import { useWaitlistForm } from "@/hooks/use-waitlist-form";

export function RegistrationForm() {
    const {
        formData,
        isSubmitted,
        isLoading,
        error,
        errors,
        cooldownSeconds,
        turnstileContainerRef,
        isTurnstileConfigured,
        canSubmit,
        handleInputChange,
        handleSubmit,
        renderTurnstile,
    } = useWaitlistForm();

    if (isSubmitted) {
        return (
            <div className="py-24 bg-transparent flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-3xl bg-bg-elevated shadow-neu-raised flex items-center justify-center mb-8 animate-fadeInScale">
                    <CheckCircle2 size={40} className="text-theme-primary" />
                </div>
                <h2 className="text-3xl font-black text-content-primary tracking-tight mb-4">You&apos;re on the list!</h2>
                <p className="text-content-secondary max-w-sm font-medium">We&apos;ll reach out shortly to discuss your integration with Offer Hub.</p>
            </div>
        );
    }

    const isDisabled = isLoading || cooldownSeconds > 0;

    return (
        <section id="waitlist-form" className="py-32 bg-transparent relative">
            {isTurnstileConfigured && (
                <Script
                    src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                    strategy="lazyOnload"
                    onLoad={renderTurnstile}
                />
            )}

            <div className="mx-auto max-w-2xl px-6">
                <div className="text-center mb-16">
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-theme-primary mb-4">Join the ecosystem</p>
                    <h2 className="text-4xl font-black text-content-primary tracking-tighter sm:text-5xl leading-none">
                        Scale your <span className="text-theme-primary">Vision</span>
                    </h2>
                    <p className="mt-6 text-lg text-content-secondary font-medium leading-relaxed">
                        Ready to integrate? Leave your details and join the next wave of payments.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="p-10 rounded-[2.5rem] bg-bg-elevated shadow-neu-raised flex flex-col gap-8"
                >
                    {error && (
                        <div role="alert" className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 flex items-start gap-3 animate-fadeIn">
                            <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    {cooldownSeconds > 0 && (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center gap-3 animate-fadeIn">
                            <Timer size={20} className="text-amber-500 flex-shrink-0" />
                            <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                                Please wait <span className="font-black">{cooldownSeconds}s</span> before trying again.
                            </p>
                        </div>
                    )}

                    <FormField
                        id="name"
                        name="name"
                        label="Full Name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        maxLength={100}
                        required
                        disabled={isDisabled}
                        icon={User}
                        error={errors.name}
                    />

                    <FormField
                        id="email"
                        name="email"
                        label="Email Address"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        maxLength={320}
                        required
                        disabled={isDisabled}
                        icon={Mail}
                        error={errors.email}
                    />

                    <FormField
                        id="purpose"
                        name="purpose"
                        label="For what would you use Offer Hub?"
                        as="textarea"
                        rows={3}
                        value={formData.purpose}
                        onChange={handleInputChange}
                        placeholder="Tell us about your marketplace or project..."
                        maxLength={500}
                        showCharCount
                        required
                        disabled={isDisabled}
                        icon={MessageSquare}
                        error={errors.purpose}
                    />

                    <FormField
                        id="referral"
                        name="referral"
                        label="How did you hear about us?"
                        value={formData.referral}
                        onChange={handleInputChange}
                        placeholder="X, Telegram, Friend, etc."
                        maxLength={200}
                        required
                        disabled={isDisabled}
                        icon={Send}
                        error={errors.referral}
                    />

                    {isTurnstileConfigured && (
                        <div ref={turnstileContainerRef} className="mx-auto" />
                    )}

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="btn-neumorphic-primary mt-4 w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading
                            ? "Submitting..."
                            : cooldownSeconds > 0
                            ? `Wait ${cooldownSeconds}s`
                            : "Submit Application"}
                        <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </form>
            </div>
        </section>
    );
}
