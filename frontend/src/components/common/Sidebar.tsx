"use client";
import { useProjectStore } from "@/store/projectStore";
import { useRouter } from "next/navigation";
import { useProject } from "@/hooks/useProject";
import { useSidebarStore } from "@/store/sidebarStore";
import { useEffect } from "react";
import { FaCaretDown, FaCaretRight } from "react-icons/fa";

export const Sidebar = ({
  projectId,
  scenarioId,
}: {
  projectId: string;
  scenarioId: string;
}) => {
  const router = useRouter();
  const { project } = useProjectStore();
  const { openScenarios, addOpenScenario, toggleOpenScenario, isOpen } =
    useSidebarStore();
  const { readScenarioTestcases, readProjectScenarios } = useProject();

  useEffect(() => {
    if (project.scenarios.length === 0 || project.id !== projectId) {
      readProjectScenarios(projectId);
    }
  }, [projectId]);

  useEffect(() => {
    if (project.scenarios.length > 0 && project.id === projectId) {
      const scenarioExists = project.scenarios.some((s) => s.id === scenarioId);
      if (scenarioExists || scenarioId === "new") {
        readScenarioTestcases(scenarioId);
        addOpenScenario(scenarioId);
      }
    }
  }, [projectId, scenarioId, project.scenarios.length, project.id]);

  const handleToggleClick = async (scenarioId: string) => {
    toggleOpenScenario(scenarioId);
    if (isOpen(scenarioId)) {
      readScenarioTestcases(scenarioId);
    }
  };

  const handleScenarioClick = (scenarioId: string) => {
    router.push(`/project/${projectId}/scenario/${scenarioId}`);
  };

  const handleTestcaseClick = (scenarioId: string, testcaseId: string) => {
    router.push(
      `/project/${projectId}/scenario/${scenarioId}/testcase/${testcaseId}`
    );
  };

  return (
    <aside className="w-72 bg-slate-50 border-r border-slate-200 flex flex-col h-[calc(100vh-84px)]">
      <div className="flex-1 p-6 overflow-y-auto">
        {project.scenarios.map((scenario) => (
          <div key={scenario.id} className="mb-2">
            <div className="flex items-center w-full font-bold text-slate-800">
              <button
                className="mr-2 focus:outline-none text-xl cursor-pointer"
                onClick={() => handleToggleClick(scenario.id)}
              >
                {scenario.testcases.length > 0 ? (
                  openScenarios.has(scenario.id) ? (
                    <FaCaretDown />
                  ) : (
                    <FaCaretRight />
                  )
                ) : (
                  <FaCaretRight />
                )}
              </button>
              <span
                className={`cursor-pointer hover:text-red-600 ${
                  scenario.id === scenarioId ? "text-red-600" : ""
                }`}
                onClick={() => handleScenarioClick(scenario.id)}
              >
                {scenario.name}
              </span>
            </div>
            {scenario.testcases.length > 0 &&
              openScenarios.has(scenario.id) && (
                <div className="ml-2">
                  {scenario.testcases.map((testcase) => (
                    <div
                      key={testcase.tcId}
                      onClick={() =>
                        handleTestcaseClick(scenario.id, testcase.tcId)
                      }
                      className={
                        "block rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100 cursor-pointer text-sm"
                      }
                    >
                      {testcase.tcId}
                    </div>
                  ))}
                </div>
              )}
          </div>
        ))}
      </div>
    </aside>
  );
};
