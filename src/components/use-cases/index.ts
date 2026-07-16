// ── Freelance ──
export { default as FreelanceSection } from "./freelance/FreelanceSection";
export { default as FreelanceHero } from "./freelance/FreelanceHero";
export { ESCROW_STEPS as freelanceEscrowSteps } from "./freelance/escrow-steps";

// ── eCommerce ──
export { default as EcommerceSection } from "./ecommerce/EcommerceSection";
export { default as EcommerceHero } from "./ecommerce/EcommerceHero";
export { ESCROW_STEPS as ecommerceEscrowSteps } from "./ecommerce/escrow-steps";

// ── DAO Payroll ──
export { default as DaoPayrollSection } from "./dao-payroll/DaoPayrollSection";
export { default as DaoPayrollHero } from "./dao-payroll/DaoPayrollHero";
export { ESCROW_STEPS as daoPayrollEscrowSteps } from "./dao-payroll/escrow-steps";

// ── Real Estate ──
export { default as RealEstateSection } from "./real-estate/RealEstateSection";
export { default as RealEstateHero } from "./real-estate/RealEstateHero";
export { ESCROW_STEPS as realEstateEscrowSteps } from "./real-estate/escrow-steps";

// ── Service Platforms ──
export { default as ServicePlatformsSection } from "./service-platforms/ServicePlatformsSection";
export { default as ServicePlatformsHero } from "./service-platforms/ServicePlatformsHero";
export { ESCROW_STEPS as servicePlatformsEscrowSteps } from "./service-platforms/escrow-steps";

// ── Shared ──
export {
  default as EscrowFlowDiagram,
  type EscrowStep,
  type EscrowFlowDiagramProps,
} from "./shared/EscrowFlowDiagram";
export {
  default as StellarImpactCards,
  type CardVariant,
  type DetailedMetricCard,
  type SimpleMetricCard,
  type MetricCard,
  type StellarImpactCardsProps,
} from "./shared/StellarImpactCards";
export {
  default as CodeIntegrationShowcase,
  type CodeTab,
  type SdkCard,
  type CodeIntegrationShowcaseProps,
} from "./shared/CodeIntegrationShowcase";
