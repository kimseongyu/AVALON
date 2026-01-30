import { getCurrentTime } from "./utils.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupReportRoutes = (server, router) => {
  // 에러 응답 유틸리티
  const sendError = (res, status, message) => {
    if (!res.headersSent) {
      res.status(status).json({
        status: status,
        divisionCode: "ERR_REPORT",
        resultMsg: message,
        errors: [],
        reason: message,
      });
    }
  };

  // 테스트시나리오 리포트 다운로드
  server.get("/api/report/v1/scenario", async (req, res) => {
    const avalon = req.cookies?.avalon;

    if (!avalon) {
      return sendError(res, 401, "Authentication required");
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const currentTime = getCurrentTime();
    const reportPath = path.join(
      __dirname,
      "..",
      "reports",
      "시나리오 리포트.csv",
    );
    const filename = `test-scenario-report-${currentTime}.csv`;

    // 파일 다운로드 처리 (Content-Disposition 헤더 자동 설정)
    res.download(reportPath, filename, (err) => {
      if (err) {
        console.error("File download error:", err);
        sendError(res, 500, "Failed to download report file");
      }
    });
  });

  // 테스트케이스 리포트 다운로드
  server.get("/api/report/v1/testcase/:scenarioId", async (req, res) => {
    const avalon = req.cookies?.avalon;
    const { scenarioId } = req.params;

    if (!avalon) {
      return sendError(res, 401, "Authentication required");
    }

    const db = router.db;
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return sendError(res, 404, "Project not found");
    }

    const scenario = project.scenarioList.find((s) => s.id === scenarioId);

    if (!scenario) {
      return sendError(res, 404, "Scenario not found");
    }

    const currentTime = getCurrentTime();
    const reportPath = path.join(
      __dirname,
      "..",
      "reports",
      "테스트케이스 리포트.csv",
    );
    const filename = `test-case-report-${scenarioId}-${currentTime}.csv`;

    // 파일 다운로드 처리 (Content-Disposition 헤더 자동 설정)
    res.download(reportPath, filename, (err) => {
      if (err) {
        console.error("File download error:", err);
        sendError(res, 500, "Failed to download report file");
      }
    });
  });
};
