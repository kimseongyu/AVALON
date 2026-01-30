import { useState } from "react";
import { clientSpecApi } from "@/services/client/clientSpecApi";
import { clientScenarioApi } from "@/services/client/clientScenarioApi";
import { uploadSpecRequest } from "@/types/spec";
import { UPLOAD_STEPS } from "@/constants/upload";
import { Scenario } from "@/interfaces/scenario";

type FileUploadCallbacks = {
  onUploadSuccess?: () => void;
  onAnalyzeSuccess?: () => void;
  onCreateScenariosSuccess?: () => void;
  onError?: (error: string) => void;
};

type UploadStep = {
  stepType: number;
  apiCall: () => Promise<any>;
  nextStep: number;
  callback?: () => void;
};

export const useFileUpload = (callbacks?: FileUploadCallbacks) => {
  const [step, setStep] = useState<number>(UPLOAD_STEPS.UPLOAD);
  const [isLoading, setIsLoading] = useState(false);

  const handleApiError = (error: unknown) => {
    console.error(error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다.";
    callbacks?.onError?.(errorMessage);
  };

  const createUploadSteps = (files: uploadSpecRequest): UploadStep[] => [
    {
      stepType: UPLOAD_STEPS.UPLOAD,
      apiCall: () => clientSpecApi.upload(files),
      nextStep: UPLOAD_STEPS.ANALYZE,
      callback: callbacks?.onUploadSuccess,
    },
    {
      stepType: UPLOAD_STEPS.ANALYZE,
      apiCall: () => clientSpecApi.analyze(),
      nextStep: UPLOAD_STEPS.CREATE_SCENARIOS,
      callback: callbacks?.onAnalyzeSuccess,
    },
    {
      stepType: UPLOAD_STEPS.CREATE_SCENARIOS,
      apiCall: () => clientScenarioApi.create(),
      nextStep: UPLOAD_STEPS.COMPLETE,
      callback: callbacks?.onCreateScenariosSuccess,
    },
  ];

  const createScenarios = async (files: uploadSpecRequest) => {
    setIsLoading(true);
    try {
      const uploadSteps = createUploadSteps(files);

      let currentStep = step;
      let lastResult: any = null;

      while (currentStep !== UPLOAD_STEPS.COMPLETE) {
        const currentStepData = uploadSteps.find(
          (s) => s.stepType === currentStep
        );

        if (!currentStepData) {
          throw new Error(`Invalid step: ${currentStep}`);
        }

        lastResult = await currentStepData.apiCall();

        currentStep = currentStepData.nextStep;
        setStep(currentStep);

        currentStepData.callback?.();
      }

      return { success: true, data: lastResult };
    } catch (error) {
      handleApiError(error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const resetStep = () => {
    setStep(UPLOAD_STEPS.UPLOAD);
  };

  return {
    createScenarios,
    step,
    setStep,
    resetStep,
    isLoading,
  };
};
