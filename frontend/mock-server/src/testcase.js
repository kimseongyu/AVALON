import {
  generateRandomTestCaseDescription,
  generateRandomPrecondition,
  generateRandomExpectedResult,
  generateRandomTestStatus,
  generateRandomTestDataCategory,
  generateRandomTestDataId,
  generateRandomTestDataKoName,
  generateRandomTestDataName,
  generateRandomTestDataContext,
  generateRandomTestDataType,
  generateRandomTestDataLength,
  generateRandomTestDataFormat,
  generateRandomTestDataDefaultValue,
  generateRandomTestDataRequired,
  generateRandomTestDataDesc,
  generateRandomTestDataValue,
} from "./utils.js";

export const CreateTestData = () => {
  return {
    paramId: generateRandomTestDataId(),
    category: generateRandomTestDataCategory(),
    koName: generateRandomTestDataKoName(),
    name: generateRandomTestDataName(),
    context: generateRandomTestDataContext(),
    type: generateRandomTestDataType(),
    length: generateRandomTestDataLength(),
    format: generateRandomTestDataFormat(),
    defaultValue: generateRandomTestDataDefaultValue(),
    required: generateRandomTestDataRequired(),
    parent: generateRandomTestDataName(),
    desc: generateRandomTestDataDesc(),
    value: generateRandomTestDataValue(),
  };
};

// 테스트케이스 생성 함수
const createTestCase = () => {
  return {
    tcId: `testcase-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}`,
    precondition: generateRandomPrecondition(),
    description: generateRandomTestCaseDescription(),
    expectedResult: generateRandomExpectedResult(),
    status: generateRandomTestStatus(),
    testDataList: Array.from({ length: 3 }, () => CreateTestData()),
  };
};

export const setupTestcaseRoutes = (server, router) => {
  // 모든 시나리오에 대해 TC 생성
  server.post("/api/tc/v1/", (req, res) => {
    const avalon = req.cookies?.avalon;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const updatedScenarioList = project.scenarioList.map((scenario) => {
      const testcaseList = Array.from({ length: 3 }, () => createTestCase());
      return {
        ...scenario,
        testcaseList,
      };
    });

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: null,
      status: "success",
      message: "Test cases created successfully",
    });
  });

  // API 목록 조회 (시나리오별)
  server.get("/api/tc/v1/api/:scenarioId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    // Mock API 목록 (시나리오에 연관된 API 목록)
    const apiList = [
      { apiId: "api-1", apiName: "Get User" },
      { apiId: "api-2", apiName: "Create Order" },
      { apiId: "api-3", apiName: "Update Item" },
    ];

    res.json({
      data: { apiList },
      status: "success",
      message: "OK",
    });
  });

  // API 파라미터(테스트 데이터) 조회
  server.get("/api/tc/v1/api/:scenarioId/:apiId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId, apiId } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    // 기존 테스트케이스의 testDataList에서 value 제외한 형태로 반환 (또는 새 생성)
    const templateData = scenario.testcaseList?.[0]?.testDataList;
    const testDataList = templateData
      ? templateData.map(({ value, ...rest }) => rest)
      : Array.from({ length: 3 }, () => {
          const data = CreateTestData();
          const { value, ...rest } = data;
          return rest;
        });

    res.json({
      data: { testDataList },
      status: "success",
      message: "OK",
    });
  });

  // 시나리오별 TC 생성 (API별)
  server.post("/api/tc/v1/api/:scenarioId/:apiId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId, apiId } = req.params;
    const { precondition, description, expectedResult, status, testDataList } =
      req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    const newTestCase = {
      tcId: `testcase-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      precondition: precondition ?? null,
      description: description ?? "",
      expectedResult: expectedResult ?? "",
      status: status ?? null,
      testDataList:
        typeof testDataList === "string"
          ? JSON.parse(testDataList)
          : testDataList ?? [],
    };

    const updatedScenarioList = project.scenarioList.map((s) => {
      if (s.id === scenarioId) {
        return {
          ...s,
          testcaseList: [...(s.testcaseList || []), newTestCase],
        };
      }
      return s;
    });

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: newTestCase.tcId,
      status: "success",
      message: "OK",
    });
  });

  // 시나리오별 TC 목록 조회
  server.get("/api/tc/v1/scenario/:scenarioId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;
    const { offset = 0, query = 10 } = req.query;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    const allTcList = scenario.testcaseList || [];
    const sliced = allTcList.slice(
      parseInt(offset, 10),
      parseInt(offset, 10) + parseInt(query, 10)
    );
    const tcTotal = allTcList.length;
    // readScenarioTestcasesResponse: tcList는 string[] (tcId 배열)
    const tcList = sliced.map((tc) => tc.tcId);

    res.json({
      data: { tcList, tcTotal },
      status: "success",
      message: "OK",
    });
  });

  // TC 상세 정보 조회
  server.get("/api/tc/v1/:tcId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { tcId } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let testcase = null;
    for (const scenario of project.scenarioList) {
      const found = scenario.testcaseList.find((tc) => tc.tcId === tcId);
      if (found) {
        testcase = found;
        break;
      }
    }

    if (!testcase) {
      return res.status(404).json({ error: "Test case not found" });
    }

    res.json({
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
  });

  // TC 수정
  server.put("/api/tc/v1/:tcId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { tcId } = req.params;
    const { precondition, description, expectedResult, status, testDataList } =
      req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let updated = false;
    const updatedScenarioList = project.scenarioList.map((scenario) => {
      const updatedTestcaseList = scenario.testcaseList.map((tc) => {
        if (tc.tcId === tcId) {
          updated = true;
          return {
            ...tc,
            precondition,
            description,
            expectedResult,
            status,
            testDataList: tc.testDataList.map((data) => {
              const matchingData = testDataList.find(
                (newData) => data.paramId === newData.paramId
              );
              if (matchingData) {
                return { ...data, value: matchingData.value };
              }
              return data;
            }),
          };
        }
        return tc;
      });
      return { ...scenario, testcaseList: updatedTestcaseList };
    });

    if (!updated) {
      return res.status(404).json({ error: "Test case not found" });
    }

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: null,
      status: "success",
      message: "Test case updated successfully",
    });
  });

  // TC 삭제
  server.delete("/api/tc/v1/:tcId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { tcId } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let deleted = false;
    const updatedScenarioList = project.scenarioList.map((scenario) => {
      const updatedTestcaseList = scenario.testcaseList.filter(
        (tc) => tc.tcId !== tcId
      );
      if (updatedTestcaseList.length !== scenario.testcaseList.length) {
        deleted = true;
      }
      return { ...scenario, testcaseList: updatedTestcaseList };
    });

    if (!deleted) {
      return res.status(404).json({ error: "Test case not found" });
    }

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: null,
      status: "success",
      message: "Test case deleted successfully",
    });
  });

  // TC 추가 (기존 시나리오별 추가 라우트 - 하위 호환)
  server.post("/api/tc/v1/scenario/:scenarioId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;
    const { precondition, description, expectedResult, testDataList } =
      req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);
    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    const newTestCase = {
      tcId: `testcase-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      precondition,
      description,
      expectedResult,
      testDataList:
        typeof testDataList === "string"
          ? JSON.parse(testDataList)
          : testDataList,
    };

    const updatedScenarioList = project.scenarioList.map((s) => {
      if (s.id === scenarioId) {
        return {
          ...s,
          testcaseList: [...s.testcaseList, newTestCase],
        };
      }
      return s;
    });

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: { tcId: newTestCase.tcId },
      status: "success",
      message: "OK",
    });
  });
};
