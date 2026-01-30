import multer from "multer";
import { getCurrentTime } from "./utils.js";
import fs from "fs";

const FILE_COUNT = 4;

// 파일 저장을 위한 multer 설정
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 파일이 저장될 디렉토리
  },
  filename: function (req, file, cb) {
    // 파일명: [timestamp]-[originalname]
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB 제한
  },
});

// 여러 파일 업로드를 위한 미들웨어
const uploadFields = upload.fields([
  { name: "requirementFile", maxCount: 1 },
  { name: "interfaceDef", maxCount: 1 },
  { name: "interfaceDesign", maxCount: 1 },
  { name: "databaseDesign", maxCount: 1 },
]);

// 업로드된 파일 삭제 함수
const cleanupFiles = (files) => {
  if (!files) return;

  Object.values(files).forEach((fileArray) => {
    fileArray.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        console.error(`Error deleting file ${file.path}:`, err);
      }
    });
  });
};

export const setupSpecRoutes = (server, router) => {
  // 명세서 업로드
  server.post("/api/spec/v1/", uploadFields, (req, res) => {
    const avalon = req.cookies?.avalon;

    if (!avalon) {
      cleanupFiles(req.files);
      return res.status(401).json({ error: "Authentication required" });
    }
    // 파일 업로드 검증
    if (!req.files || Object.keys(req.files).length !== FILE_COUNT) {
      cleanupFiles(req.files);
      return res.status(400).json({
        error: "At least one file must be uploaded",
        required: [
          "requirementFile",
          "interfaceDef",
          "interfaceDesign",
          "databaseDesign",
        ],
      });
    }

    const db = router.db;

    // 프로젝트 찾기
    const project = db.get("projects").find({ avalon: avalon }).value();

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const currentTime = getCurrentTime();

    // 업로드된 파일 정보 저장
    const uploadedFiles = {};
    Object.keys(req.files).forEach((key) => {
      if (req.files[key][0]) {
        uploadedFiles[key] = {
          filename: req.files[key][0].filename,
          originalname: req.files[key][0].originalname,
          path: req.files[key][0].path,
          size: req.files[key][0].size,
          mimetype: req.files[key][0].mimetype,
        };
      }
    });

    // 프로젝트에 파일 정보 업데이트
    db.get("projects")
      .find({ avalon: avalon })
      .assign({
        specFiles: uploadedFiles,
        lastUpdated: currentTime,
      })
      .write();

    // 응답 헤더 설정
    res.set("requestTime", currentTime);

    // 1초 지연
    setTimeout(() => {
      res.json({
        data: null,
        status: "success",
        message: "Files uploaded successfully",
      });
    }, 1000);
  });

  server.post("/api/spec/v1/analyze", (req, res) => {
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

    const currentTime = getCurrentTime();

    // 응답 헤더 설정
    res.set("requestTime", currentTime);

    // 1초 지연
    setTimeout(() => {
      res.json({
        data: null,
        status: "success",
        message: "Files analyzed successfully",
      });
    }, 1000);
  });
};
