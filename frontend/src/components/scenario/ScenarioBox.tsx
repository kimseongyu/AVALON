"use client";
import { ScenarioGraph } from "./ScenarioGraph";
import { TextInputBox } from "../common/TextInputBox";
import { LinkButton } from "../common/LinkButton";
import { ActionButton } from "../common/ActionButton";
import { useScenario } from "@/hooks/useScenario";
import { useRouter } from "next/navigation";
import { INFO_MESSAGES, DELETE_MESSAGES } from "@/constants/messages";

export const ScenarioBox = ({
  projectId,
  scenarioId,
}: {
  projectId: string;
  scenarioId: string;
}) => {
  const router = useRouter();
  const {
    scenarioInfo,
    isLoading,
    error,
    success,
    handleNameChange,
    handleDescriptionChange,
    handleValidationChange,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useScenario(projectId, scenarioId);

  const onCreateSuccess = (newScenarioId: string) => {
    alert(INFO_MESSAGES.SCENARIO.CREATE_INFO);
    router.push(`/project/${projectId}/scenario/${newScenarioId}`);
  };

  const onUpdateSuccess = () => {
    alert(INFO_MESSAGES.SCENARIO.UPDATE_INFO);
  };

  const onDeleteSuccess = (scenarioId: string | null, total: number) => {
    if (total === 0) {
      router.push(`/project/${projectId}/upload`);
    } else {
      router.push(`/project/${projectId}/scenario/${scenarioId}`);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <input
                type="text"
                value={scenarioInfo.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1 min-w-[300px]"
                placeholder="시나리오 이름을 입력하세요"
              />
              <span className="text-sm text-slate-500 whitespace-nowrap">
                {scenarioInfo.id}
              </span>
            </h2>
            <div className="flex gap-2">
              {scenarioId === "new" ? (
                <ActionButton
                  onClick={() => handleCreate(onCreateSuccess)}
                  color="bg-transparent text-slate-700 hover:text-orange-500"
                  disabled={isLoading}
                >
                  생성
                </ActionButton>
              ) : (
                <>
                  <LinkButton
                    href={`/project/${projectId}/scenario/new`}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    ariaLabel="시나리오 추가"
                  >
                    시나리오 추가
                  </LinkButton>
                  <LinkButton
                    href={`/project/${projectId}/scenario/${scenarioId}/testcase/new`}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    ariaLabel="TC 추가"
                  >
                    TC 추가
                  </LinkButton>
                  <ActionButton
                    onClick={() => {
                      if (window.confirm(DELETE_MESSAGES.SCENARIO)) {
                        handleDelete(onDeleteSuccess);
                      }
                    }}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    disabled={isLoading}
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleUpdate(onUpdateSuccess)}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    disabled={isLoading}
                  >
                    저장
                  </ActionButton>
                </>
              )}
            </div>
          </div>
          <ScenarioGraph graph={scenarioInfo.graph} />
          <div className="h-[250px] flex gap-8">
            <TextInputBox
              title="상세설명"
              value={scenarioInfo.description}
              placeholder="시나리오에 대한 상세 설명을 입력하세요"
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
            <TextInputBox
              title="검증포인트"
              value={scenarioInfo.validation}
              placeholder="시나리오에 대한 검증포인트를 입력하세요"
              onChange={(e) => handleValidationChange(e.target.value)}
            />
          </div>
          {error ? (
            <div className="h-6 mt-1 text-sm text-red-600">{error}</div>
          ) : (
            <div className="h-6 mt-1 text-sm text-green-600">{success}</div>
          )}
        </>
      )}
    </>
  );
};
