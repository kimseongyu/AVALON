import { SuccessResponse, ErrorResponse } from "@/types/api";
import { handleApiResponse } from "@/utils/apiUtils";
import ky from "ky-universal";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/report/v1`;

export const clientReportApi = {
  readScenarioReport: async (): Promise<Response> => {
    return await ky.get(`${BASE_URL}/scenario`, {
      credentials: "include",
    });
  },
  readTestcaseReport: async (scenarioId: string): Promise<Response> => {
    return await ky.get(`${BASE_URL}/testcase/${scenarioId}`, {
      credentials: "include",
    });
  },
};
