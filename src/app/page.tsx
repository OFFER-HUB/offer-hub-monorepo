import { Navbar } from "@/components/layout/Navbar";
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
