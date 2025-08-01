import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import travelRoutes from "./routes/travel.js";
import { TokenCleanupScheduler } from "./utils/tokenCleanup.js";

// 환경 변수 로드
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// ES 모듈에서 __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
}));

// 정적 파일 서빙 (업로드된 파일들)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 정적 파일 서빙 (public 폴더 - 기본 이미지 등)
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// 라우터 설정
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api", travelRoutes);

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "CheckOn Backend API",
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "/api/auth/sign-up (파일 업로드 지원, 기본 이미지 자동 설정)",
        signin: "/api/auth/sign-in",
        signout: "/api/auth/sign-out",
        findId: "/api/auth/find-id",
        resetPassword: "/api/auth/reset-password",
        refresh: "/api/auth/refresh",
      },
      user: "/api/user",
      travel: {
        travelInfo: {
          GET: "/api/travel-info (전체 리스트)",
          GET_BY_ID: "/api/travel-info/:id (개별 조회)",
          POST: "/api/travel-info",
          PATCH: "/api/travel-info/:id",
          DELETE: "/api/travel-info/:id",
        },
      },
      files: {
        profilePhotos: "/uploads/profiles/[filename]",
        defaultProfile: "/images/default-profile.svg",
      },
    },
  });
});

// 404 에러 핸들러
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "요청한 리소스를 찾을 수 없습니다",
  });
});

// 전역 에러 핸들러
app.use((err: any, req: any, res: any, next: any) => {
  console.error("서버 오류:", err);
  res.status(500).json({
    success: false,
    message: "서버 내부 오류가 발생했습니다",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api`);
  
  // 토큰 정리 스케줄러 시작
  TokenCleanupScheduler.start();
});
