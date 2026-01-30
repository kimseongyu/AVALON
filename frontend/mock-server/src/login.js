import { getCurrentTime, generateUUIDv7 } from "./utils.js";

export const setupLoginRoutes = (server, router) => {
  // 커스텀 프로젝트 생성 API
  server.post("/api/project/v1/", (req, res) => {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: "projectId is required" });
    }

    // 기존 프로젝트 확인
    const db = router.db;
    const existingProject = db
      .get("projects")
      .find({ projectId: projectId })
      .value();

    const currentTime = getCurrentTime();
    const avalon = generateUUIDv7();

    // 응답 헤더 설정
    res.set("requestTime", currentTime);
    res.cookie("avalon", avalon, {
      httpOnly: true,
      secure: false, // 개발환경에서는 false
      sameSite: "lax",
    });

    if (existingProject) {
      db.get("projects")
        .find({ projectId: projectId })
        .assign({ avalon: avalon })
        .write();

      // 기존 프로젝트 ID 반환 (SuccessResponse 형식)
      return res.json({
        data: null,
        status: "success",
        message: "Existing project found",
      });
    } else {
      // 새로운 프로젝트 생성
      const newProject = {
        id: Date.now(), // 간단한 ID 생성
        projectId: projectId,
        createdAt: currentTime,
        avalon: avalon, // 쿠키 정보 저장
        scenarioList: [],
      };

      db.get("projects").push(newProject).write();

      return res.json({
        data: null,
        status: "success",
        message: "New project created",
      });
    }
  });

  server.delete("/api/project/v1/", (req, res) => {
    const currentTime = getCurrentTime();
    const avalon = req.cookies ? req.cookies.avalon : undefined; // 안전한 접근

    // 응답 헤더 설정
    res.set("requestTime", currentTime);

    // 쿠키 삭제
    res.cookie("avalon", "", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 0,
    });

    // 프로젝트의 쿠키 정보도 삭제
    if (avalon) {
      const db = router.db;
      db.get("projects")
        .find({ avalon: avalon })
        .assign({ avalon: null })
        .write();
    }

    return res.status(200).json({
      data: null,
      status: "success",
      message: "Logged out successfully",
    });
  });

  // 커스텀 프로젝트 삭제 API
  server.delete("/api/project/v1/:projectId", (req, res) => {
    const { projectId } = req.params;
    const db = router.db;
    const projects = db.get("projects");

    // 프로젝트 존재 여부 확인
    const project = projects.find({ projectId }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // 프로젝트 삭제
    projects.remove({ projectId }).write();

    // 응답 헤더 설정
    res.set("requestTime", getCurrentTime());

    return res.status(200).json({
      data: null,
      status: "success",
      message: "Project deleted successfully",
    });
  });
};
