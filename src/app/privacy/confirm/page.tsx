import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ConfirmDataRequest } from "./ConfirmDataRequest";

export const metadata: Metadata = {
  title: "Confirm Data Request",
  robots: { index: false, follow: false },
};

export default function ConfirmDataRequestPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-28 pb-20 px-4 sm:px-8">
        <Suspense fallback={null}>
          <ConfirmDataRequest />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
