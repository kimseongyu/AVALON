import type { Metadata } from "next";
import "./globals.css";
import { MSWComponent } from "@/mocks/MSWComponent";

export const metadata: Metadata = {
  title: "AVALON",
  description: "AI-based Validation of API Logic and Operation with Novelty",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="ko">
      <body>
        <MSWComponent />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
