"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface OfferData {
  details: { projectDescription: string; requirements: string; deliverables: string };
  terms: { paymentTerms: string; milestones: string; rate: number };
  timeline: { deadline: string };
}

interface SendOfferContextType {
  data: OfferData;
  setData: (updates: Partial<OfferData>) => void;
}

const SendOfferContext = createContext<SendOfferContextType | undefined>(undefined);

export const SendOfferProvider = ({ children }: { children: ReactNode }) => {
  const [data, setDataState] = useState<OfferData>({
    details: { projectDescription: "", requirements: "", deliverables: "" },
    terms: { paymentTerms: "", milestones: "", rate: 0 },
    timeline: { deadline: "" },
  });

  const setData = (updates: Partial<OfferData>) =>
    setDataState((prev) => ({ ...prev, ...updates }));

  return (
    <SendOfferContext.Provider value={{ data, setData }}>
      {children}
    </SendOfferContext.Provider>
  );
};

export const useSendOffer = () => {
  const context = useContext(SendOfferContext);
  if (!context) throw new Error("useSendOffer must be used inside SendOfferProvider");
  return context;
};
