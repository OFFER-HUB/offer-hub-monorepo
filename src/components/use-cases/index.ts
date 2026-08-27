// ── Freelance ──
export { FreelanceSection } from "./freelance/FreelanceSection";
export { ESCROW_STEPS as freelanceEscrowSteps } from "./freelance/escrow-flow.data";

// ── eCommerce ──
export { EcommerceSection } from "./ecommerce/EcommerceSection";
export { ESCROW_STEPS as ecommerceEscrowSteps } from "./ecommerce/escrow-flow.data";

// ── DAO Payroll ──
export { DaoPayrollSection } from "./dao-payroll/DaoPayrollSection";
export { ESCROW_STEPS as daoPayrollEscrowSteps } from "./dao-payroll/escrow-flow.data";

// ── Real Estate ──
export { RealEstateSection } from "./real-estate/RealEstateSection";
export { ESCROW_STEPS as realEstateEscrowSteps } from "./real-estate/escrow-flow.data";

// ── Service Platforms ──
export { ServicePlatformsSection } from "./service-platforms/ServicePlatformsSection";
export { ESCROW_STEPS as servicePlatformsEscrowSteps } from "./service-platforms/escrow-flow.data";

// ── Shared ──
export {
  EscrowFlowDiagram,
  type EscrowStep,
  type EscrowFlowDiagramProps,
} from "./shared/EscrowFlowDiagram";

export {
  UseCaseHero,
  type UseCaseHeroProps,
  type UseCaseHeroStat,
  type HeroNode,
  type HeroLink,
} from "./shared/UseCaseHero";

export {
  StellarImpactCards,
  type CardVariant,
  type DetailedMetricCard,
  type SimpleMetricCard,
  type MetricCard,
  type StellarImpactCardsProps,
} from "./shared/StellarImpactCards";
export {
  CodeIntegrationShowcase,
  type CodeTab,
  type SdkCard,
  type CodeIntegrationShowcaseProps,
} from "./shared/CodeIntegrationShowcase";
