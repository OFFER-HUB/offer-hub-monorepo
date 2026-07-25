import { BlueprintMotionSection } from "@/components/shared/BlueprintMotionSection";
import EvolutionTimelineView from "./evolution-timeline/EvolutionTimelineView";

export default function EvolutionTimeline() {
  return (
    <BlueprintMotionSection id="evolution" className="py-20 bg-bg-base">
      <EvolutionTimelineView />
    </BlueprintMotionSection>
  );
}