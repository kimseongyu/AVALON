import { http, HttpResponse, delay } from "msw";
import {
  createScenario,
  createTestCase,
  CreateTestData,
  generateUUIDv7,
  getCurrentTime,
} from "./utils";

// LocalStorage DB Helper
const DB_KEY = "avalon_mock_db";

interface Project {
  id: number;
  projectId: string;
  createdAt: string;
  avalon: string | null;
  scenarioList: any[];
  specFiles?: any;
  lastUpdated?: string;
}

interface DB {
  projects: Project[];
}

const getDB = (): DB => {
  const dbStr = localStorage.getItem(DB_KEY);
  if (dbStr) {
    return JSON.parse(dbStr);
  }
  const initialDB: DB = { projects: [] };
  localStorage.setItem(DB_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const saveDB = (db: DB) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const handlers = [
  // --- Login / Project ---

  // Create Project (Login)
  http.post(`${BASE_URL}/project/v1`, async ({ request }) => {
    const body = (await request.json()) as { projectId: string };
    const { projectId } = body;

    if (!projectId) {
      return HttpResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const db = getDB();
    const existingProject = db.projects.find((p) => p.projectId === projectId);
    const currentTime = getCurrentTime();
    const avalon = generateUUIDv7();

    if (existingProject) {
      existingProject.avalon = avalon;
      saveDB(db);
      
      return HttpResponse.json(
        {
          data: null,
          status: "success",
          message: "Existing project found",
        },
        {
          headers: {
            "Set-Cookie": `avalon=${avalon}; Path=/; SameSite=Lax`,
            "requestTime": currentTime,
          },
        }
      );
    } else {
      const newProject: Project = {
        id: Date.now(),
        projectId: projectId,
        createdAt: currentTime,
        avalon: avalon,
        scenarioList: [],
      };
      db.projects.push(newProject);
      saveDB(db);

      return HttpResponse.json(
        {
          data: null,
          status: "success",
          message: "New project created",
        },
        {
          headers: {
            "Set-Cookie": `avalon=${avalon}; Path=/; SameSite=Lax`,
            "requestTime": currentTime,
          },
        }
      );
    }
  }),

  // Logout
  http.delete(`${BASE_URL}/project/v1`, async ({ cookies }) => {
    const currentTime = getCurrentTime();
    const avalon = cookies.avalon;

    if (avalon) {
      const db = getDB();
      const project = db.projects.find((p) => p.avalon === avalon);
      if (project) {
        project.avalon = null;
        saveDB(db);
      }
    }

    return HttpResponse.json(
      {
        data: null,
        status: "success",
        message: "Logged out successfully",
      },
      {
        headers: {
          "Set-Cookie": `avalon=; Path=/; Max-Age=0; SameSite=Lax`,
          "requestTime": currentTime,
        },
      }
    );
  }),

  // Delete Project
  http.delete(`${BASE_URL}/project/v1/:projectId`, async ({ params }) => {
    const { projectId } = params;
    const db = getDB();
    const projectIndex = db.projects.findIndex((p) => p.projectId === projectId);

    if (projectIndex === -1) {
      return HttpResponse.json({ error: "Project not found" }, { status: 404 });
    }

    db.projects.splice(projectIndex, 1);
    saveDB(db);

    return HttpResponse.json(
      {
        data: null,
        status: "success",
        message: "Project deleted successfully",
      },
      {
        headers: {
          "requestTime": getCurrentTime(),
        },
      }
    );
  }),

  // --- Scenario ---

  // Create Scenario (Auto Generate 5)
  http.post(`${BASE_URL}/scenario/v1/create`, async ({ cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);

    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const newScenarios = Array.from({ length: 5 }, () => createScenario());
    project.scenarioList = newScenarios;
    saveDB(db);

    await delay(1000);

    return HttpResponse.json({
      data: {
        scenarioList: newScenarios.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        total: newScenarios.length,
      },
      status: "success",
      message: "OK",
    });
  }),

  // Add Single Scenario
  http.post(`${BASE_URL}/scenario/v1`, async ({ request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = (await request.json()) as any;
    const { name, description, validation } = body;

    if (!name || !description || !validation) {
      return HttpResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "description", "validation"],
        },
        { status: 400 }
      );
    }

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const newScenario = {
      id: `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name,
      description,
      validation,
      graph: "",
      testcaseList: [],
    };

    project.scenarioList = [...(project.scenarioList || []), newScenario];
    saveDB(db);

    return HttpResponse.json({ data: { id: newScenario.id }, status: "success", message: "OK" });
  }),

  // Update Scenario
  http.put(`${BASE_URL}/scenario/v1/:scenarioId`, async ({ params, request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { scenarioId } = params;
    const body = (await request.json()) as any;
    const { name, description, validation } = body;

    if (!name || !description || !validation) {
        return HttpResponse.json(
          {
            error: "Missing required fields",
            required: ["name", "description", "validation"],
          },
          { status: 400 }
        );
      }

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });

    scenario.name = name;
    scenario.description = description;
    scenario.validation = validation;
    saveDB(db);

    return HttpResponse.json({
      data: null,
      status: "success",
      message: "Scenario updated successfully",
    });
  }),

  // Delete Scenario
  http.delete(`${BASE_URL}/scenario/v1/scenario/:id`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { id } = params;
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenarioIndex = project.scenarioList.findIndex((s) => s.id === id);
    if (scenarioIndex !== -1) {
      project.scenarioList.splice(scenarioIndex, 1);
      saveDB(db);
    }

    return HttpResponse.json({ data: null, status: "success", message: "Scenario deleted successfully" });
  }),

  // Get Single Scenario
  http.get(`${BASE_URL}/scenario/v1/scenario/:id`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { id } = params;
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === id);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });

    return HttpResponse.json({
      data: {
        id: scenario.id,
        name: scenario.name,
        graph: scenario.graph,
        description: scenario.description,
        validation: scenario.validation,
      },
      status: "success",
      message: "OK",
    });
  }),

  // Get All Scenarios
  http.get(`${BASE_URL}/scenario/v1/project`, async ({ request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const query = parseInt(url.searchParams.get("query") || "10", 10);

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const sliced = project.scenarioList.slice(offset, offset + query);

    return HttpResponse.json({
      data: {
        scenarioList: sliced.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        total: project.scenarioList.length,
      },
      status: "success",
      message: "OK",
    });
  }),

  // --- Spec (Simulation) ---

  http.post(`${BASE_URL}/spec/v1`, async ({ request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    // MSW doesn't handle FormData files efficiently for storage, but we can simulate success.
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const currentTime = getCurrentTime();
    
    // Simulate file info storage
    project.specFiles = {
        requirementFile: { filename: "mock_req.xlsx", originalname: "req.xlsx" },
        interfaceDef: { filename: "mock_def.xlsx", originalname: "def.xlsx" },
        interfaceDesign: { filename: "mock_design.xlsx", originalname: "design.xlsx" },
        databaseDesign: { filename: "mock_db.xlsx", originalname: "db.xlsx" },
    };
    project.lastUpdated = currentTime;
    saveDB(db);

    await delay(1000);

    return HttpResponse.json(
      {
        data: null,
        status: "success",
        message: "Files uploaded successfully",
      },
      {
        headers: { requestTime: currentTime },
      }
    );
  }),

  http.post(`${BASE_URL}/spec/v1/analyze`, async ({ cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    await delay(1000);

    return HttpResponse.json(
      {
        data: null,
        status: "success",
        message: "Files analyzed successfully",
      },
      {
        headers: { requestTime: getCurrentTime() },
      }
    );
  }),

  // --- TestCase ---

  // Create TCs for all scenarios
  http.post(`${BASE_URL}/tc/v1`, async ({ cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    project.scenarioList = project.scenarioList.map((scenario) => ({
      ...scenario,
      testcaseList: Array.from({ length: 3 }, () => createTestCase()),
    }));
    saveDB(db);

    return HttpResponse.json({
      data: null,
      status: "success",
      message: "Test cases created successfully",
    });
  }),

  // Get TC List for Scenario
  http.get(`${BASE_URL}/tc/v1/scenario/:scenarioId`, async ({ params, request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { scenarioId } = params;
    const url = new URL(request.url);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);
    const query = parseInt(url.searchParams.get("query") || "10", 10);

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });

    const allTcList = scenario.testcaseList || [];
    const sliced = allTcList.slice(offset, offset + query);

    return HttpResponse.json({
      data: {
        tcList: sliced.map((tc: any) => tc.tcId),
        tcTotal: allTcList.length,
      },
      status: "success",
      message: "OK",
    });
  }),

  // Get Single TC
  http.get(`${BASE_URL}/tc/v1/:tcId`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { tcId } = params;
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    let testcase = null;
    for (const scenario of project.scenarioList) {
      const found = scenario.testcaseList?.find((tc: any) => tc.tcId === tcId);
      if (found) {
        testcase = found;
        break;
      }
    }

    if (!testcase) return HttpResponse.json({ error: "Test case not found" }, { status: 404 });

    return HttpResponse.json({
      data: {
        tcId: testcase.tcId,
        precondition: testcase.precondition,
        description: testcase.description,
        expectedResult: testcase.expectedResult,
        status: testcase.status,
        testDataList: testcase.testDataList,
      },
      status: "success",
      message: "OK",
    });
  }),

  // Update TC
  http.put(`${BASE_URL}/tc/v1/:tcId`, async ({ params, request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { tcId } = params;
    const body = (await request.json()) as any;
    const { precondition, description, expectedResult, status, testDataList } = body;

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    let updated = false;
    for (const scenario of project.scenarioList) {
        if (scenario.testcaseList) {
            const tcIndex = scenario.testcaseList.findIndex((tc: any) => tc.tcId === tcId);
            if (tcIndex !== -1) {
                const tc = scenario.testcaseList[tcIndex];
                scenario.testcaseList[tcIndex] = {
                    ...tc,
                    precondition,
                    description,
                    expectedResult,
                    status,
                    testDataList: tc.testDataList.map((data: any) => {
                         const matchingData = testDataList?.find((newData: any) => data.paramId === newData.paramId);
                         return matchingData ? { ...data, value: matchingData.value } : data;
                    }),
                };
                updated = true;
                break;
            }
        }
    }

    if (!updated) return HttpResponse.json({ error: "Test case not found" }, { status: 404 });

    saveDB(db);
    return HttpResponse.json({ data: null, status: "success", message: "Test case updated successfully" });
  }),

  // Delete TC
  http.delete(`${BASE_URL}/tc/v1/:tcId`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { tcId } = params;
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    let deleted = false;
    for (const scenario of project.scenarioList) {
        if (scenario.testcaseList) {
            const initialLength = scenario.testcaseList.length;
            scenario.testcaseList = scenario.testcaseList.filter((tc: any) => tc.tcId !== tcId);
            if (scenario.testcaseList.length !== initialLength) {
                deleted = true;
                break;
            }
        }
    }

    if (!deleted) return HttpResponse.json({ error: "Test case not found" }, { status: 404 });

    saveDB(db);
    return HttpResponse.json({ data: null, status: "success", message: "Test case deleted successfully" });
  }),
  
  // API List for Scenario
  http.get(`${BASE_URL}/tc/v1/api/:scenarioId`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });
    
    // Mock Data
    const apiList = [
      { apiId: "api-1", apiName: "Get User" },
      { apiId: "api-2", apiName: "Create Order" },
      { apiId: "api-3", apiName: "Update Item" },
    ];

    return HttpResponse.json({ data: { apiList }, status: "success", message: "OK" });
  }),
  
  // Get API Test Data (Template)
  http.get(`${BASE_URL}/tc/v1/api/:scenarioId/:apiId`, async ({ params, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { scenarioId } = params;
    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });

    // Reuse existing test data structure if available, or create new
    const templateData = scenario.testcaseList?.[0]?.testDataList;
    const testDataList = templateData
      ? templateData.map(({ value, ...rest }: any) => rest)
      : Array.from({ length: 3 }, () => {
          const data = CreateTestData();
          const { value, ...rest } = data;
          return rest;
        });

    return HttpResponse.json({
        data: { testDataList },
        status: "success",
        message: "OK",
      });
  }),
  
  // Create TC per API
  http.post(`${BASE_URL}/tc/v1/api/:scenarioId/:apiId`, async ({ params, request, cookies }) => {
     const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { scenarioId } = params;
    const body = (await request.json()) as any;
    const { precondition, description, expectedResult, status, testDataList } = body;

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });

    const newTestCase = {
        tcId: `testcase-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        precondition: precondition ?? null,
        description: description ?? "",
        expectedResult: expectedResult ?? "",
        status: status ?? null,
        testDataList: typeof testDataList === "string" ? JSON.parse(testDataList) : testDataList ?? [],
    };

    scenario.testcaseList = [...(scenario.testcaseList || []), newTestCase];
    saveDB(db);

    return HttpResponse.json({
        data: newTestCase.tcId,
        status: "success",
        message: "OK",
    });
  }),

  // --- API Test Execution ---

  http.post(`${BASE_URL}/test/v1/run`, async ({ request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const body = (await request.json()) as any;
    const { scenarioList } = body;

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    let parsedScenarioList = typeof scenarioList === "string" ? JSON.parse(scenarioList) : scenarioList;

    if (!Array.isArray(parsedScenarioList) || parsedScenarioList.length === 0) {
        return HttpResponse.json({ error: "Scenario list must be a non-empty array" }, { status: 400 });
    }

    const targetScenarios = project.scenarioList.filter((s) => parsedScenarioList.includes(s.id));

    targetScenarios.forEach(scenario => {
        const updatedTestCases = (scenario.testcaseList || []).map((tc: any) => {
             const randomResult = Math.random();
             let isSuccess;
             if (randomResult < 0.7) isSuccess = "성공";
             else if (randomResult < 0.8) isSuccess = "실패";
             else if (randomResult < 0.9) isSuccess = "실행중";
             else isSuccess = "준비중";

             return { ...tc, isSuccess, executedTime: `${Math.floor(Math.random() * 1000)}ms` };
        });

        let scenarioSuccess;
        if (updatedTestCases.every((tc: any) => tc.isSuccess === "성공")) scenarioSuccess = "성공";
        else if (updatedTestCases.some((tc: any) => tc.isSuccess === "실행중")) scenarioSuccess = "실행중";
        else if (updatedTestCases.some((tc: any) => tc.isSuccess === "실패")) scenarioSuccess = "실패";
        else scenarioSuccess = "준비중";
        
        scenario.testcaseList = updatedTestCases;
        scenario.isSuccess = scenarioSuccess;
    });

    saveDB(db);

    return HttpResponse.json({
      data: null,
      status: "success",
      message: "API test execution completed",
    });
  }),

  http.get(`${BASE_URL}/test/v1/result`, async ({ request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const size = parseInt(url.searchParams.get("size") || "10", 10);

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    let scenarioList = project.scenarioList.filter((s) => "isSuccess" in s);

    if (cursor) {
        const cursorIndex = scenarioList.findIndex((s) => s.id === cursor);
        if (cursorIndex !== -1) scenarioList = scenarioList.slice(cursorIndex + 1);
    }
    
    if (size > 0) scenarioList = scenarioList.slice(0, size);

    return HttpResponse.json({
      data: {
        scenarioList: scenarioList.map((scenario) => ({
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            isSuccess: scenario.isSuccess,
        })),
      },
      status: "success",
      message: "OK",
    });
  }),

  http.get(`${BASE_URL}/test/v1/result/:scenarioId`, async ({ params, request, cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });

    const { scenarioId } = params;
    const url = new URL(request.url);
    const cursor = url.searchParams.get("cursor");
    const size = parseInt(url.searchParams.get("size") || "10", 10);

    const db = getDB();
    const project = db.projects.find((p) => p.avalon === avalon);
    if (!project) return HttpResponse.json({ error: "Project not found" }, { status: 404 });

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) return HttpResponse.json({ error: "Scenario not found" }, { status: 404 });
    if (!("isSuccess" in scenario)) return HttpResponse.json({ error: "Test results not available" }, { status: 400 });

    let tcList = scenario.testcaseList || [];

    if (cursor) {
        const cursorIndex = tcList.findIndex((tc: any) => tc.tcId === cursor);
        if (cursorIndex !== -1) tcList = tcList.slice(cursorIndex + 1);
    }

    if (size > 0) tcList = tcList.slice(0, size);

    return HttpResponse.json({
        data: {
            scenarioId: scenario.id,
            scenarioName: scenario.name,
            tcList: tcList.map((tc: any) => ({
                tcId: tc.tcId,
                description: tc.description,
                expectedResult: tc.expectedResult,
                isSuccess: tc.isSuccess,
                executedTime: tc.executedTime,
            })),
        },
        status: "success",
        message: "OK",
    });
  }),
  
  // --- Reports (Download Simulation) ---
  
  http.get(`${BASE_URL}/report/v1/scenario`, async ({ cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });
    
    // CSV Simulation
    const csvContent = "Scenario ID,Name,Status\n1,Test Scenario,PASS";
    const blob = new Blob([csvContent], { type: "text/csv" });
    
    return new HttpResponse(blob, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="test-scenario-report-${Date.now()}.csv"`,
        },
    });
  }),

  http.get(`${BASE_URL}/report/v1/testcase/:scenarioId`, async ({ cookies }) => {
    const avalon = cookies.avalon;
    if (!avalon) return HttpResponse.json({ error: "Authentication required" }, { status: 401 });
    
    const csvContent = "TestCase ID,Description,Status\n1,Check Login,PASS";
     const blob = new Blob([csvContent], { type: "text/csv" });

     return new HttpResponse(blob, {
        headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="test-case-report-${Date.now()}.csv"`,
        },
    });
  }),
];