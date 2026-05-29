import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: {
    absolute: "OFFER-HUB — Trustless Payments Orchestrator for Marketplaces",
  },
  description:
    "OFFER-HUB empowers marketplaces to provide secure, non-custodial escrow payments without building complex payment infrastructure from scratch.",
  keywords: [
    "escrow",
    "marketplace payments",
    "non-custodial",
    "Stellar",
    "Trustless Work",
    "Airtm",
    "payment orchestration",
    "USDC",
  ],
};
import { Footer } from "@/components/layout/Footer";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import SupportedBySection from "@/components/SupportedBySection";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import RegistrationForm from "@/components/community/RegistrationForm";
import LoadingBar from "@/components/ui/LoadingBar";

export default function Home() {
  return (
    <>
      <LoadingBar />
      <Navbar />
      <HeroSection />
      <SupportedBySection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <RegistrationForm />
      <Footer />
    </>
  );
}
