import { NavigationHeader } from "@/components/common/NavigationHeader";
import { Suspense } from "react";

const ScenarioLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Suspense fallback={<div>Loading header...</div>}>
        <NavigationHeader />
      </Suspense>
      {children}
    </div>
  );
};

export default ScenarioLayout;
