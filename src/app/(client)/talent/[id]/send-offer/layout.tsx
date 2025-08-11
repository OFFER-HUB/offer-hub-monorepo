"use client";

import { SendOfferProvider } from "@/components/send-offer/SendOfferContext";



export default function SendOfferLayout({ children }: { children: React.ReactNode }) {
  return <SendOfferProvider>{children}</SendOfferProvider>;
}
