"use client";

import { useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/common/Sidebar";
import { Suspense } from "react";

const Content = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const scenarioId = searchParams.get("scenarioId") || "";

  return (
    <div className="flex flex-1">
      <Sidebar projectId={projectId} scenarioId={scenarioId} />
      <main className="flex-1 p-12 overflow-y-auto h-[calc(100vh-84px)]">
        {children}
      </main>
    </div>
  );
};

export const ScenarioLayoutContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <Content>{children}</Content>
    </Suspense>
  );
};
