import express from 'express';
import favoriteItemReviewController from './favoriteItemReview.controller.js';
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// 후기 찜 추가
router.post('/', authenticateToken, favoriteItemReviewController.addFavorite);

// 찜한 후기 전체 조회
router.get('/', authenticateToken, favoriteItemReviewController.getFavorites);

// 찜한 후기 개별 조회
router.get('/:reviewId', authenticateToken, favoriteItemReviewController.getFavoriteById);

// 찜한 후기 삭제
router.delete('/:reviewId', authenticateToken, favoriteItemReviewController.removeFavorite);

export default router;
