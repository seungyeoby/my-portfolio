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

// 좋아요 추가/취소 (params 방식으로 개선)
router.post('/:reviewId/like', authenticateToken, itemReviewController.toggleFavoriteReview);

export default router;

// authenticate 미들웨어를 사용하여 인증된 사용자만 접근할 수 있도록 설정