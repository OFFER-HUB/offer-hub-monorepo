"use client";

import CodeIntegrationShowcase from "@/components/use-cases/shared/CodeIntegrationShowcase";
import { description, sdkCards, tabs } from "./code-tabs";

export default function RealEstateCodeIntegrationShowcase() {
  return (
    <CodeIntegrationShowcase
      description={description}
      tabs={tabs}
      sdkCards={sdkCards}
    />
  );
}
