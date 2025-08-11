"use client";

import { useSendOffer } from "@/components/send-offer/SendOfferContext";



export default function SuccessPage() {
  const { data } = useSendOffer();

  return (
    <div>
      <h1>Offer Sent Successfully 🎉</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
