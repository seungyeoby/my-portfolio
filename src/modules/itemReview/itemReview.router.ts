import express, { Router } from 'express';
import itemReviewController from './itemReview.controller.js';
import { uploadItemImage } from "../../middlewares/upload.js";
import { authenticateToken } from "../../middlewares/auth.js";
const router: Router = express.Router();

// 준비물 후기 작성
router.post('/', authenticateToken, uploadItemImage, itemReviewController.createItemReview);

// 전체 준비물 후기 조회 (sort: likes | recent), 카테고리 필터링 포함
router.get('/', itemReviewController.getAllItemReviews);

// 개별 준비물 후기 조회
router.get('/:reviewId', itemReviewController.getItemReviewById);

// 준비물 후기 수정 (작성자 or 관리자)
router.patch('/:reviewId', authenticateToken, itemReviewController.updateItemReview);

// 준비물 후기 삭제 (작성자 or 관리자)
router.delete('/:reviewId', authenticateToken, itemReviewController.deleteItemReview);

// 찜 많은 순으로 준비물 추천
router.get('/top-liked', itemReviewController.getTopLikedReviewSummary);

export default router;