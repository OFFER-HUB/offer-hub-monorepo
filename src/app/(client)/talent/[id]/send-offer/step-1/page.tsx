"use client";

import OfferFormStep1 from "@/components/send-offer/OfferFormStep1";
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
        <div className="bg-[#f6f6f6] min-h-screen flex  justify-center py-14 px-7  " >



            <OfferFormStep1 />


        </div>
    );
}
