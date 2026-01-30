"use client";

import { useEffect } from "react";

export const MSWComponent = () => {
  useEffect(() => {
    // 개발 환경이거나 특정 환경 변수가 설정된 경우에만 실행
    // GitHub Pages 배포 시에도 실행되도록 로직 조정 필요 시 조건문 수정
    if (typeof window !== "undefined") {
      const initMsw = async () => {
        const { worker } = await import("./browser");
        await worker.start({
          onUnhandledRequest: "bypass", // 처리되지 않은 요청은 통과
          serviceWorker: {
            url:
              process.env.NEXT_PUBLIC_MSW_WORKER_URL || "/mockServiceWorker.js",
          },
        });
      };
      initMsw();
    }
  }, []);

  return null;
};
