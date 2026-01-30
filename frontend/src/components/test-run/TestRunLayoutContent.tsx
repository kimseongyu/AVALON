"use client";

import { useSearchParams } from "next/navigation";
import { TestRunSidebar } from "@/components/test-run/TestRunSidebar";
import { Suspense } from "react";

const Content = ({ children }: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";

  return (
    <div className="flex flex-1">
      <TestRunSidebar projectId={projectId} />
      <main className="flex-1 p-12 overflow-y-auto h-[calc(100vh-84px)]">
        {children}
      </main>
    </div>
  );
};

export const TestRunLayoutContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <Suspense fallback={<div>Loading sidebar...</div>}>
      <Content>{children}</Content>
    </Suspense>
  );
};
