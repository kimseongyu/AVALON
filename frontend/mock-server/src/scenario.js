import {
  generateRandomName,
  generateRandomDescription,
  generateRandomValidation,
} from "./utils.js";

// 시나리오 생성 함수
const createScenario = () => {
  return {
    id: `scenario-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    name: generateRandomName(),
    description: generateRandomDescription(),
    validation: generateRandomValidation(),
    graph: `graph LR
    A[시작] --> B{조건 확인}
    B -->|성공| C[처리 실행]
    B -->|실패| D[에러 처리]
    C --> E[결과 검증]
    E -->|통과| F[성공 응답]
    E -->|실패| G[실패 응답]
    D --> H[에러 응답]
    F --> I[종료]
    G --> I
    H --> I`,
    testcaseList: [],
  };
};

export const setupScenarioRoutes = (server, router) => {
  // Create a new scenario
  server.post("/api/scenario/v1/create", (req, res) => {
    const avalon = req.cookies?.avalon;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 5개의 시나리오 생성
    const scenarioList = Array.from({ length: 5 }, () => createScenario());

    // 프로젝트의 시나리오 목록 업데이트
    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList })
      .write();

    // 1초 지연
    setTimeout(() => {
      res.json({
        data: {
          scenarioList: scenarioList.map((s) => ({
            id: s.id,
            name: s.name,
          })),
          total: scenarioList.length,
        },
        status: "success",
        message: "OK",
      });
    }, 1000);
  });

  // Add a single scenario
  server.post("/api/scenario/v1/", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { name, description, validation } = req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!name || !description || !validation) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "description", "validation"],
      });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 새로운 시나리오 생성
    const newScenario = {
      id: `scenario-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)}`,
      name,
      description,
      validation,
      graph: "",
      testcaseList: [],
    };

    // 프로젝트의 시나리오 목록에 추가
    const updatedScenarioList = [...(project.scenarioList || []), newScenario];

    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: { id: newScenario.id },
      status: "success",
      message: "OK",
    });
  });

  // Update a scenario
  server.put("/api/scenario/v1/:scenarioId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;
    const { name, description, validation } = req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!name || !description || !validation) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "description", "validation"],
      });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 시나리오 찾기
    const scenarioIndex = project.scenarioList.findIndex(
      (s) => s.id === scenarioId
    );
    if (scenarioIndex === -1) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    // 시나리오 업데이트
    const updatedScenarioList = [...project.scenarioList];
    updatedScenarioList[scenarioIndex] = {
      ...updatedScenarioList[scenarioIndex],
      name,
      description,
      validation,
    };

    // DB 업데이트
    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: null,
      status: "success",
      message: "Scenario updated successfully",
    });
  });

  // Delete a scenario
  server.delete("/api/scenario/v1/scenario/:id", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { id } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 시나리오 삭제
    const scenarioIndex = project.scenarioList.findIndex((s) => s.id === id);

    if (scenarioIndex === -1) {
      // 이미 삭제되었거나 존재하지 않는 경우에도 성공으로 처리 (멱등성 보장)
      return res.status(200).json({
        data: null,
        status: "success",
        message: "Scenario already deleted or not found",
      });
    }

    const updatedScenarioList = [...project.scenarioList];
    updatedScenarioList.splice(scenarioIndex, 1);

    // DB 업데이트
    db.get("projects")
      .find({ avalon: avalon })
      .assign({ scenarioList: updatedScenarioList })
      .write();

    res.json({
      data: null,
      status: "success",
      message: "Scenario deleted successfully",
    });
  });

  // Get a single scenario
  server.get("/api/scenario/v1/scenario/:id", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { id } = req.params;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 시나리오 찾기
    const scenario = project.scenarioList.find((s) => s.id === id);

    if (!scenario) {
      return res.status(404).json({ error: "Scenario not found" });
    }

    res.json({
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
  });

  // Get all scenarios in a project
  server.get("/api/scenario/v1/project", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { offset = 0, query = 10 } = req.query;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const scenarioList = project.scenarioList.slice(
      parseInt(offset, 10),
      parseInt(offset, 10) + parseInt(query, 10)
    );

    res.json({
      data: {
        scenarioList: scenarioList.map((s) => ({
          id: s.id,
          name: s.name,
        })),
        total: scenarioList.length,
      },
      status: "success",
      message: "OK",
    });
  });
};
