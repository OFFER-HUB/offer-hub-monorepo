import type { Metadata } from "next";
import HeroRepoStatsSection from "@/components/community/HeroRepoStatsSection";
import ContributorsSection from "@/components/community/ContributorsSection";
import HowToContribute from "@/components/community/HowToContribute";
import RecentPRsSection from "@/components/community/RecentPRsSection";
import OpenIssuesSection from "@/components/community/OpenIssuesSection";
import RepoLinksSection from "@/components/community/RepoLinksSection";
import CommunityChannelsSection from "@/components/community/CommunityChannelsSection";
import RegistrationForm from "@/components/community/RegistrationForm";
import LoadingBar from "@/components/ui/LoadingBar";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { buildPageMetadata } from "@/lib/seo";
import { fetchCommunityData } from "@/services/github";

export const revalidate = 600;

export const metadata: Metadata = buildPageMetadata({
  title: "Community",
  description:
    "Join the OFFER-HUB open-source community. Explore contributors, open issues, recent pull requests, and learn how to get involved.",
  keywords: [
    "community",
    "open source",
    "contributors",
    "GitHub",
    "OFFER-HUB",
    "contribute",
  ],
  path: "/community",
  ogImageAlt: "OFFER-HUB Community — contributors, issues, and pull requests",
});

export default async function CommunityPage() {
  const { stats, contributors, pullRequests, issues } = await fetchCommunityData();

  return (
    <>
      <LoadingBar />
      <Navbar />
      <main className="pt-28">
        <HeroRepoStatsSection stats={stats} />
        <RepoLinksSection />
        <ContributorsSection contributors={contributors} />
        <RecentPRsSection pullRequests={pullRequests} />
        <OpenIssuesSection issues={issues} />
        <HowToContribute />
        <CommunityChannelsSection />
        <RegistrationForm />
      </main>
      <Footer />
    </>
  );
}
