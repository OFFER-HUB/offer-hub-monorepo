// Export send-offer components for cleaner imports
export { OfferFormStep1 } from "./OfferFormStep1";
export { OfferFormStep2 } from "./OfferFormStep2";
export { OfferFormStep3 } from "./OfferFormStep3";
export { OfferSuccess } from "./OfferSuccess";
export { OfferFormProvider, useOfferForm } from "./OfferFormContext";

// Export types
export type {
  OfferFormData,
  PaymentMilestone,
} from "@/lib/mockData/offer-form-mock";
