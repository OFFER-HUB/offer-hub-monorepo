"use client";

import { useSendOffer } from "@/components/send-offer/SendOfferContext";
import { useRouter, useParams } from "next/navigation";


export default function Step1Page() {
  const router = useRouter();
  const { id } = useParams();
  const { data, setData } = useSendOffer();

  const handleNext = () => {
    setData({
      details: { projectDescription: "My project", requirements: "Some requirements", deliverables: "Final files" }
    });
    router.push(`/talent/${id}/send-offer/step-2`);
  };

  return (
    <div>
      <h1>Step 1 - Offer Details</h1>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
