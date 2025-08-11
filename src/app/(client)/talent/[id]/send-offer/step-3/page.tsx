"use client";

import { useSendOffer } from "@/components/send-offer/SendOfferContext";
import { useRouter, useParams } from "next/navigation";


export default function Step3Page() {
  const router = useRouter();
  const { id } = useParams();
  const { data, setData } = useSendOffer();

  const handleSubmit = () => {
    setData({
      timeline: { deadline: "2025-08-15" }
    });
    router.push(`/talent/${id}/send-offer/success`);
  };

  const handleBack = () => {
    router.push(`/talent/${id}/send-offer/step-2`);
  };

  return (
    <div>
      <h1>Step 3 - Timeline & Review</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
