import {
  createScenarioRequest,
  readScenarioResponse,
  updateScenarioRequest,
  readProjectScenariosResponse,
  createScenarioResponse,
} from "@/types/scenario";
import { SuccessResponse, ErrorResponse } from "@/types/api";
import { handleApiResponse } from "@/utils/apiUtils";
import ky from "ky-universal";

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/scenario/v1`;

export const clientScenarioApi = {
  create: async (): Promise<readProjectScenariosResponse> => {
    try {
      const res = await ky
        .post(`${BASE_URL}/create`, {
          credentials: "include",
          retry: {
            limit: 0,
          },
        })
        .json<SuccessResponse<readProjectScenariosResponse> | ErrorResponse>();

      return handleApiResponse(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  createScenario: async (
    scenario: createScenarioRequest
  ): Promise<createScenarioResponse> => {
    try {
      const res = await ky
        .post(`${BASE_URL}`, {
          credentials: "include",
          json: scenario,
          retry: {
            limit: 0,
          },
        })
        .json<SuccessResponse<createScenarioResponse> | ErrorResponse>();

      return handleApiResponse(res);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  readScenario: async (scenarioId: string): Promise<readScenarioResponse> => {
    const res = await ky
      .get(`${BASE_URL}/scenario/${scenarioId}`, {
        credentials: "include",
      })
      .json<SuccessResponse<readScenarioResponse> | ErrorResponse>();

    return handleApiResponse(res);
  },
  updateScenario: async (
    scenarioId: string,
    scenario: updateScenarioRequest
  ): Promise<void> => {
    try {
      await ky
        .put(`${BASE_URL}/${scenarioId}`, {
          credentials: "include",
          json: scenario,
          retry: {
            limit: 0,
          },
        })
        .json<SuccessResponse<null> | ErrorResponse>();
    } catch (error) {
      console.error(error);
    }
  },
  deleteScenario: async (scenarioId: string): Promise<void> => {
    const res = await ky
      .delete(`${BASE_URL}/scenario/${scenarioId}`, {
        credentials: "include",
      })
      .json<SuccessResponse<null> | ErrorResponse>();

    handleApiResponse(res);
  },
  readProjectScenarios: async (): Promise<readProjectScenariosResponse> => {
    const res = await ky
      .get(`${BASE_URL}/project`, {
        credentials: "include",
      })
      .json<SuccessResponse<readProjectScenariosResponse> | ErrorResponse>();

    return handleApiResponse(res);
  },
};
