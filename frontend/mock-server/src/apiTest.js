export const setupApiTestRoutes = (server, router) => {
  // API 테스트 실행
  server.post("/api/test/v1/run", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioList } = req.body;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 테스트할 시나리오 목록 결정
    if (!scenarioList) {
      return res.status(400).json({ error: "Scenario list is required" });
    }

    let parsedScenarioList =
      typeof scenarioList === "string"
        ? JSON.parse(scenarioList)
        : scenarioList;

    if (!Array.isArray(parsedScenarioList) || parsedScenarioList.length === 0) {
      return res
        .status(400)
        .json({ error: "Scenario list must be a non-empty array" });
    }

    let targetScenarios = project.scenarioList.filter((s) =>
      parsedScenarioList.includes(s.id)
    );

    // 각 시나리오에 대해 테스트 결과 설정
    const updatedScenarios = targetScenarios.map((scenario) => {
      // 각 테스트케이스에 대해 랜덤 결과 설정
      const updatedTestCases = scenario.testcaseList.map((tc) => {
        const randomResult = Math.random();
        let isSuccess;
        if (randomResult < 0.7) {
          isSuccess = "성공";
        } else if (randomResult < 0.8) {
          isSuccess = "실패";
        } else if (randomResult < 0.9) {
          isSuccess = "실행중";
        } else {
          isSuccess = "준비중";
        }

        return {
          ...tc,
          isSuccess,
          executedTime: `${Math.floor(Math.random() * 1000)}ms`,
        };
      });

      // 시나리오의 전체 성공 여부 계산
      let scenarioSuccess;
      if (updatedTestCases.every((tc) => tc.isSuccess === "성공")) {
        scenarioSuccess = "성공";
      } else if (updatedTestCases.some((tc) => tc.isSuccess === "실행중")) {
        scenarioSuccess = "실행중";
      } else if (updatedTestCases.some((tc) => tc.isSuccess === "실패")) {
        scenarioSuccess = "실패";
      } else {
        scenarioSuccess = "준비중";
      }

      return {
        ...scenario,
        testcaseList: updatedTestCases,
        isSuccess: scenarioSuccess,
      };
    });

    // DB 업데이트
    const updatedProject = {
      ...project,
      scenarioList: project.scenarioList.map((scenario) => {
        const updatedScenario = updatedScenarios.find(
          (s) => s.id === scenario.id
        );
        return updatedScenario || scenario;
      }),
    };

    db.get("projects").find({ avalon: avalon }).assign(updatedProject).write();

    res.json({
      data: null,
      status: "success",
      message: "API test execution completed",
    });
  });

  // 시나리오별 테스트 결과 조회
  server.get("/api/test/v1/result", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { cursor, size } = req.query;

    if (!avalon) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    let scenarioList = project.scenarioList.filter(
      (scenario) => "isSuccess" in scenario
    );

    // cursor 기반 페이지네이션 (cursor가 있을 때만)
    if (cursor) {
      const cursorIndex = scenarioList.findIndex(
        (scenario) => scenario.id === cursor
      );
      if (cursorIndex !== -1) {
        scenarioList = scenarioList.slice(cursorIndex + 1);
      }
    }

    // size만큼만 반환 (size가 있을 때만)
    if (size) {
      const sizeNum = parseInt(size, 10);
      if (!isNaN(sizeNum) && sizeNum > 0) {
        scenarioList = scenarioList.slice(0, sizeNum);
      }
    }

    // 응답 데이터 구성 (SuccessResponse)
    const data = {
      scenarioList: scenarioList.map((scenario) => ({
        scenarioId: scenario.id,
        scenarioName: scenario.name,
        isSuccess: scenario.isSuccess,
      })),
    };

    res.json({
      data,
      status: "success",
      message: "OK",
    });
  });

  // 테스트케이스 별 테스트 결과 조회
  server.get("/api/test/v1/result/:scenarioId", (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;
    const { cursor, size } = req.query;

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

    if (!("isSuccess" in scenario)) {
      return res
        .status(400)
        .json({ error: "Test results not available for this scenario" });
    }

    let tcList = scenario.testcaseList;

    // cursor 기반 페이지네이션 (cursor가 있을 때만)
    if (cursor) {
      const cursorIndex = tcList.findIndex((tc) => tc.tcId === cursor);
      if (cursorIndex !== -1) {
        tcList = tcList.slice(cursorIndex + 1);
      }
    }

    // size만큼만 반환 (size가 있을 때만)
    if (size) {
      const sizeNum = parseInt(size, 10);
      if (!isNaN(sizeNum) && sizeNum > 0) {
        tcList = tcList.slice(0, sizeNum);
      }
    }

    // 응답 데이터 구성 (SuccessResponse)
    const data = {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      tcList: tcList.map((tc) => ({
        tcId: tc.tcId,
        description: tc.description,
        expectedResult: tc.expectedResult,
        isSuccess: tc.isSuccess,
        executedTime: tc.executedTime,
      })),
    };

    res.json({
      data,
      status: "success",
      message: "OK",
    });
  });
};
