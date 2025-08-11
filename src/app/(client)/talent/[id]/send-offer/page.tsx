"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function SendOfferRedirect() {
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    router.replace(`/talent/${id}/send-offer/step-1`);
  }, [id, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#F6F6F6] ">
      <p>Loading offer form...</p>
    </div>
  );
}
