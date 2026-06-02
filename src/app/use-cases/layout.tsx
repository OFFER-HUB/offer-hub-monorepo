import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Industry Use Cases",
    description: "Explore how OFFER HUB's non-custodial escrow orchestrates payment workflows across Freelance, eCommerce, DAOs, and Real Estate.",
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
};

export default function UseCasesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
