"use client";
import { useRouter } from "next/navigation";
import { useProjectAuth } from "@/hooks/useProjectAuth";
import { DELETE_MESSAGES } from "@/constants/messages";

export const LoginProjectBox = () => {
  const router = useRouter();
  const {
    projectId,
    isLoading,
    error,
    success,
    handleProjectIdChange,
    handleLogin,
    handleDelete,
  } = useProjectAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleProjectIdChange(e.target.value);
  };

  const onLoginSuccess = (scenarioId: string | null, total: number) => {
    if (total > 0) {
      router.push(`/project/scenario?projectId=${projectId}&scenarioId=${scenarioId}`);
    } else {
      router.push(`/project/upload?projectId=${projectId}`);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-8 w-[512px]">
      <div className="flex gap-2 items-start">
        <div className="flex-1">
          <input
            name="projectId"
            value={projectId}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-3 text-lg ${
              error
                ? "border-red-500 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            } focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              error ? "focus:ring-red-500" : "focus:ring-blue-500"
            }`}
            placeholder="project id"
          />
        </div>
        <button
          onClick={() => handleLogin(onLoginSuccess)}
          disabled={isLoading || !!error}
          className={`px-6 py-3 text-lg rounded-lg transition-colors bg-blue-500 text-white hover:bg-blue-600`}
        >
          로그인
        </button>
      </div>
      {error ? (
        <div className="h-6 mt-1 text-sm text-red-600">{error}</div>
      ) : (
        <div className="h-6 mt-1 text-sm text-green-600">{success}</div>
      )}
      <button
        onClick={() => {
          if (window.confirm(DELETE_MESSAGES.PROJECT)) {
            handleDelete();
          }
        }}
        disabled={isLoading || !!error}
        className={`w-full py-3 text-lg rounded-lg transition-colors bg-red-500 text-white hover:bg-red-600`}
      >
        프로젝트 삭제
      </button>
    </div>
  );
};
