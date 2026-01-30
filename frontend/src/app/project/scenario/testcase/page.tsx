"use client";

import { TestcaseBox } from "@/components/testcase/TestcaseBox";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TestcaseContent = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId") || "";
  const scenarioId = searchParams.get("scenarioId") || "";
  const testcaseId = searchParams.get("testcaseId") || "";

  return (
    <TestcaseBox
      projectId={projectId}
      scenarioId={scenarioId}
      testcaseId={testcaseId}
    />
  );
};

export default function TestcasePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestcaseContent />
    </Suspense>
  );
}