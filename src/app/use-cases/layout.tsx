import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// Metadata lives in the layout because UseCasesClient owns the whole page and
// runs on the client, which cannot export a metadata object.
export const metadata: Metadata = buildPageMetadata({
    title: "Industry Use Cases",
    description:
        "Explore how OFFER-HUB's non-custodial escrow orchestrates payment workflows across Freelance, eCommerce, DAO payroll, Real Estate, and service platforms.",
    keywords: [
        "use cases",
        "freelance",
        "ecommerce",
        "DAO payroll",
        "real estate",
        "escrow",
        "OFFER-HUB",
        "marketplace",
    ],
    path: "/use-cases",
    ogImageAlt:
        "OFFER-HUB use cases across freelance, eCommerce, DAO payroll, and real estate",
});

export default function UseCasesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
