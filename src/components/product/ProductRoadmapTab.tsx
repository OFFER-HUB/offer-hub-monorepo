import { TractionSection } from "@/components/architecture/TractionSection";
import { SCFTrancheRoadmap } from "@/components/architecture/SCFTrancheRoadmap";
import { EvolutionTimeline } from "@/components/blueprint/EvolutionTimeline";

export function ProductRoadmapTab() {
  return (
    <div className="flex flex-col gap-10">
      {/* Platform Traction */}
      <TractionSection />

      {/* SCF Build #44 Delivery Schedule */}
      <SCFTrancheRoadmap />

      {/* Complete Evolution Timeline */}
      <EvolutionTimeline />
    </div>
  );
}
