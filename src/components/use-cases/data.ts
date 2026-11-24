import { useCaseData as daoPayroll } from "./dao-payroll/data";
import { useCaseData as ecommerce } from "./ecommerce/data";
import { useCaseData as freelance } from "./freelance/data";
import { useCaseData as realEstate } from "./real-estate/data";
import { useCaseData as servicePlatforms } from "./service-platforms/data";
import {
  USE_CASE_IDS,
  getSourcedMetrics,
  isUseCaseId,
  type UseCaseData,
  type UseCaseId,
} from "./types";

export const USE_CASE_DATA: Record<UseCaseId, UseCaseData> = {
  freelance,
  ecommerce,
  "dao-payroll": daoPayroll,
  "real-estate": realEstate,
  "service-platforms": servicePlatforms,
};

/** Ordered list used by the vertical selector. */
export const USE_CASES: UseCaseData[] = USE_CASE_IDS.map(
  (id) => USE_CASE_DATA[id],
);

export const DEFAULT_USE_CASE_ID: UseCaseId = USE_CASE_IDS[0];

export function getUseCaseData(id: UseCaseId): UseCaseData {
  return USE_CASE_DATA[id];
}

export { USE_CASE_IDS, getSourcedMetrics, isUseCaseId };
export type { UseCaseData, UseCaseId };
