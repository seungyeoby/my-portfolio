import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
// import authRoutes from "./modules/auth/auth.router.js";
// import userRoutes from "./modules/user/user.router.js";
import travelRoutes from "./modules/travel/travel.router.js";
import recommendationRouter from "./modules/recommendations/recommendation.router.js";
import myRouter from "./modules/my/my.router.js";
import itemRouter from "./modules/items/items.router.js";
import citiesRouter from "./modules/cities/cities.router.js";
import itemReviewRouter from "./modules/itemReview/itemReview.router.js";
import favoriteItemReviewRouter from "./modules/favoriteItemReview/favoriteItemReview.router.js";
import sharedChecklistRouter from "./modules/sharedChecklist/sharedChecklist.router.js";
// import { TokenCleanupScheduler } from "./utils/tokenCleanup.js";
//import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import errorHandlingMiddleware from "./middlewares/error-handling.js";
import authRouter from "./modules/auth1/auth.router.js";
import "express-async-errors";

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
  origin: "http://localhost:5173", // 프론트 주소
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], // :흰색_확인_표시: Authorization 추가
}))

// 정적 파일 서빙 (업로드된 파일들)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 정적 파일 서빙 (public 폴더 - 기본 이미지 등)
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// 라우터 설정
app.use("/auth", authRouter);
// app.use("/api/auth", authRoutes);
//app.use("/api/user", userRoutes);
app.use("/api", travelRoutes);
app.use("/my", myRouter);
app.use("/recommendations", recommendationRouter);
app.use("/items", itemRouter);
app.use("/cities", citiesRouter);
app.use("/item-reviews", itemReviewRouter);
app.use("/favorite-item-reviews", favoriteItemReviewRouter);
app.use("/shared-checklists", sharedChecklistRouter);

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
      my: "/my",
      recommendations: "/recommendations",
      items: "/items",
      cities: "/cities",
      files: {
        profilePhotos: "/uploads/profiles/[filename]",
        defaultProfile: "/images/default-profile.svg",
      },
    },
  });
});

// 404 에러 핸들러 (모든 라우트 처리 후)
// app.use(notFoundHandler);

// // 전역 에러 핸들러 (모든 미들웨어 처리 후)
// app.use(errorHandler);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api`);

  // 토큰 정리 스케줄러 시작
  // const tokenCleanupScheduler = new TokenCleanupScheduler();
  // tokenCleanupScheduler.start();
});
