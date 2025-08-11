"use client";

import { useSendOffer } from "@/components/send-offer/SendOfferContext";
import { useRouter, useParams } from "next/navigation";


export default function Step2Page() {
  const router = useRouter();
  const { id } = useParams();
  const { data, setData } = useSendOffer();

  const handleNext = () => {
    setData({
      terms: { paymentTerms: "Milestone", milestones: "2", rate: 500 }
    });
    router.push(`/talent/${id}/send-offer/step-3`);
  };

  const handleBack = () => {
    router.push(`/talent/${id}/send-offer/step-1`);
  };

  return (
    <div>
      <h1>Step 2 - Terms & Budget</h1>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleNext}>Next</button>
    </div>
  );
}
