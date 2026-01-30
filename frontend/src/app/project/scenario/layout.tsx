import { ScenarioLayoutContent } from "@/components/scenario/ScenarioLayoutContent";

const ScenarioLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <ScenarioLayoutContent>{children}</ScenarioLayoutContent>;
};

export default ScenarioLayout;