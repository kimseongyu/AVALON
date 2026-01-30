"use client";
import { TestcaseDataTable } from "./TestcaseDataTable";
import { TextInputBox } from "../common/TextInputBox";
import { LinkButton } from "../common/LinkButton";
import { ActionButton } from "../common/ActionButton";
import { useTestcase } from "@/hooks/useTestcase";
import { useRouter } from "next/navigation";
import { DELETE_MESSAGES } from "@/constants/messages";

export const TestcaseBox = ({
  projectId,
  scenarioId,
  testcaseId,
}: {
  projectId: string;
  scenarioId: string;
  testcaseId: string;
}) => {
  const router = useRouter();
  const {
    testcaseInfo,
    apiList,
    selectedApiId,
    isLoading,
    error,
    success,
    handlePreconditionChange,
    handleDescriptionChange,
    handleExpectedResultChange,
    handleTestDataListChange,
    handleApiChange,
    handleCreate,
    handleUpdate,
    handleDelete,
  } = useTestcase(projectId, scenarioId, testcaseId);

  const onCreateSuccess = (tcId: string) => {
    router.push(
      `/project/scenario?projectId=${projectId}&scenarioId=${scenarioId}&testcaseId=${tcId}`
    );
  };

  const onDeleteSuccess = () => {
    router.push(
      `/project/scenario?projectId=${projectId}&scenarioId=${scenarioId}`
    );
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
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-slate-800">
                {testcaseInfo.tcId}
              </h2>
              {testcaseId === "new" && (
                <div className="flex items-center gap-2">
                  <select
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    value={selectedApiId}
                    onChange={(e) => handleApiChange(e.target.value)}
                  >
                    <option value="">API 선택</option>
                    {apiList.map((api) => (
                      <option key={api.apiId} value={api.apiId}>
                        {api.apiName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {testcaseId === "new" ? (
                <ActionButton
                  onClick={() => handleCreate(onCreateSuccess)}
                  color="bg-transparent text-slate-700 hover:text-orange-500"
                  disabled={isLoading || !selectedApiId}
                >
                  생성
                </ActionButton>
              ) : (
                <>
                  <LinkButton
                    href={`/project/scenario?projectId=${projectId}&scenarioId=new`}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    ariaLabel="시나리오 추가"
                  >
                    시나리오 추가
                  </LinkButton>
                  <LinkButton
                    href={`/project/scenario?projectId=${projectId}&scenarioId=${scenarioId}&testcaseId=new`}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    ariaLabel="TC 추가"
                  >
                    TC 추가
                  </LinkButton>
                  <ActionButton
                    onClick={() => {
                      if (window.confirm(DELETE_MESSAGES.TESTCASE)) {
                        handleDelete(onDeleteSuccess);
                      }
                    }}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    disabled={isLoading}
                  >
                    삭제
                  </ActionButton>
                  <ActionButton
                    onClick={handleUpdate}
                    color="bg-transparent text-slate-700 hover:text-orange-500"
                    disabled={isLoading}
                  >
                    저장
                  </ActionButton>
                </>
              )}
            </div>
          </div>
          <div className="h-[200px] flex gap-8 mb-8">
            <TextInputBox
              title="사전 조건"
              value={testcaseInfo.precondition || ""}
              placeholder="테스트케이스의 사전 조건을 입력하세요"
              onChange={(e) => handlePreconditionChange(e.target.value)}
            />
            <TextInputBox
              title="내용"
              value={testcaseInfo.description}
              placeholder="테스트케이스의 내용을 입력하세요"
              onChange={(e) => handleDescriptionChange(e.target.value)}
            />
          </div>
          <TestcaseDataTable
            testDataList={testcaseInfo.testDataList || []}
            onTestDataListChange={handleTestDataListChange}
          />
          <div className="h-[250px] flex gap-8">
            <TextInputBox
              title="예상 결과"
              value={testcaseInfo.expectedResult}
              placeholder="테스트케이스의 예상 결과를 입력하세요"
              onChange={(e) => handleExpectedResultChange(e.target.value)}
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
