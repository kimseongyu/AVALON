"use client";

import { TestRunBox } from "@/components/test-run/TestRunBox";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const TestRunContent = () => {
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get("scenarioId") || "";

  return <TestRunBox scenarioId={scenarioId} />;
};

export default function TestRunPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TestRunContent />
    </Suspense>
  );
}