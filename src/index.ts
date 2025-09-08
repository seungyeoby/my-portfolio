
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import recommendationRouter from './modules/recommendations/recommendation.router.js';
import myRouter from './modules/my/my.router.js';
import itemRouter from './modules/items/items.router.js';
import citiesRouter from './modules/cities/cities.router.js';
import itemReviewRouter from './modules/itemReview/itemReview.router.js';
import favoriteItemReviewRouter from './modules/favoriteItemReview/favoriteItemReview.router.js';
import favoriteItemReviewController from './modules/favoriteItemReview/favoriteItemReview.controller.js';
import sharedChecklistRouter from './modules/sharedChecklist/sharedChecklist.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.js';
import authRouter from './modules/auth/auth.router.js';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import uploadRouter from './routes/upload.router.js';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// ── ESM 안전한 경로 계산
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const UPLOAD_ROOT = path.join(ROOT_DIR, 'uploads');
const PUBLIC_IMAGES = path.join(ROOT_DIR, 'public', 'images');

// ── 미들웨어
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── 정적 파일 서빙
app.use('/uploads', express.static(UPLOAD_ROOT));
app.use('/images', express.static(PUBLIC_IMAGES));
app.use('/upload', uploadRouter);

// ── 라우터
app.use('/auth', authRouter);
app.use('/my', myRouter);
app.use('/recommendations', recommendationRouter);
app.use('/items', itemRouter);
app.use('/cities', citiesRouter);
app.use('/item-reviews', itemReviewRouter);
app.use('/favorite-item-reviews', favoriteItemReviewRouter);
app.use('/shared-checklists', sharedChecklistRouter);

// (선택) REST alias: PUT/DELETE /item-reviews/:reviewId/like
const likeRouter = express.Router();
likeRouter.put('/:reviewId/like', favoriteItemReviewController.setLikeTrue);
likeRouter.delete('/:reviewId/like', favoriteItemReviewController.setLikeFalse);
app.use('/item-reviews', likeRouter);

// ── 에러 핸들러
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
