import { clientScenarioApi } from "@/services/client/clientScenarioApi";
import { clientTestcaseApi } from "@/services/client/clientTestcaseApi";
import { useProjectStore } from "@/store/projectStore";
import { useState } from "react";

export const useProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { project, setProject } = useProjectStore();

  const readProjectScenarios = async (projectId: string) => {
    if (isLoading) return false;

    setIsLoading(true);
    try {
      const response = await clientScenarioApi.readProjectScenarios();
      if (response.total === 0) return false;
      setProject({
        id: projectId,
        scenarios: response.scenarioList.map((s) => ({ ...s, testcases: [] })),
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const readScenarioTestcases = async (scenarioId: string) => {
    if (isLoading || scenarioId === "new") return false;

    setIsLoading(true);
    try {
      const response = await clientTestcaseApi.readScenarioTestcases(
        scenarioId
      );
      if (response.tcTotal === 0) return false;
      setProject({
        ...project,
        scenarios: project.scenarios.map((scenario) =>
          scenario.id === scenarioId
            ? {
                ...scenario,
                testcases: response.tcList.map((tcId) => ({ tcId })),
              }
            : scenario
        ),
      });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    project,
    isLoading,
    readProjectScenarios,
    readScenarioTestcases,
  };
};
