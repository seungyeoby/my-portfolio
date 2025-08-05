import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import recommendationRouter from "./modules/recommendations/recommendation.router.js";
import myRouter from "./modules/my/my.router.js";
import itemRouter from "./modules/items/items.router.js";
import citiesRouter from "./modules/cities/cities.router.js";
import itemReviewRouter from "./modules/itemReview/itemReview.router.js";
import favoriteItemReviewRouter from "./modules/favoriteItemReview/favoriteItemReview.router.js";
import sharedChecklistRouter from "./modules/sharedChecklist/sharedChecklist.router.js";
import errorHandlingMiddleware from "./middlewares/error-handling.js";
import authRouter from "./modules/auth/auth.router.js";
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
app.use(cors());

// 정적 파일 서빙 (업로드된 파일들)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 정적 파일 서빙 (public 폴더 - 기본 이미지 등)
app.use("/images", express.static(path.join(__dirname, "../public/images")));

// 라우터 설정
app.use("/auth", authRouter);
app.use("/my", myRouter);
app.use("/recommendations", recommendationRouter);
app.use("/items", itemRouter);
app.use("/cities", citiesRouter);
app.use("/item-reviews", itemReviewRouter);
app.use("/favorite-item-reviews", favoriteItemReviewRouter);
app.use("/shared-checklists", sharedChecklistRouter);

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
