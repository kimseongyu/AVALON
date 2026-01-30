"use client";

import { UploadBox } from "@/components/upload/UploadBox";
import { Suspense } from "react";

export default function UploadPage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <Suspense fallback={<div>Loading...</div>}>
        <UploadBox />
      </Suspense>
    </main>
  );
}