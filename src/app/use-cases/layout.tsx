import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Industry Use Cases — OFFER HUB",
    description: "Explore how OFFER HUB's non-custodial escrow orchestrates payment workflows across Freelance, eCommerce, DAOs, and Real Estate.",
};

export default function UseCasesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
