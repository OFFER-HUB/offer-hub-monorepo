import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WalletPage } from "@/components/wallet/WalletPage";

export const metadata: Metadata = {
  title: "Wallet — OFFER-HUB",
  description:
    "Manage your USDC balance, submit withdrawal requests, and view your transaction history.",
};

export default function WalletRoute() {
  return (
    <>
      <Navbar />
      <WalletPage />
      <Footer />
    </>
  );
}