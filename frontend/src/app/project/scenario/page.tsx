"use client";

import { ScenarioBox } from "@/components/scenario/ScenarioBox";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const ScenarioContent = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const scenarioId = searchParams.get("scenarioId") || "";

  return <ScenarioBox projectId={projectId} scenarioId={scenarioId} />;
};

export default function ScenarioDetailPage() {
  return (
     <Suspense fallback={<div>Loading...</div>}>
        <ScenarioContent />
     </Suspense>
  );
}