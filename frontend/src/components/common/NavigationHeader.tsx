"use client";

import { useSearchParams } from "next/navigation";
import { Navigation } from "@/components/common/Navigation";

export const NavigationHeader = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  return (
    <header className="w-full border-b border-slate-200 py-4 px-4 md:px-8 bg-white">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-slate-800 truncate">
          {projectId}
        </h1>
        <Navigation />
      </div>
    </header>
  );
};
