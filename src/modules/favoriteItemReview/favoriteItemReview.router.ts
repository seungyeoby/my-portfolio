// modules/favoriteItemReview/favoriteItemReview.router.ts
import express from 'express';
import favoriteItemReviewController from './favoriteItemReview.controller.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * GET /favorite-item-reviews
 * 내 찜 목록 조회 (카테고리/작성자/제목 포함 DTO)
 */
router.get('/', authenticateToken, favoriteItemReviewController.getFavorites);

/**
 * GET /favorite-item-reviews/:reviewId
 * 내 찜 단건 조회
 */
router.get('/:reviewId(\\d+)', authenticateToken, favoriteItemReviewController.getFavoriteById);

/**
 * POST /favorite-item-reviews/:reviewId
 * 찜 추가(활성화) — 멱등적으로 처리되며 이미 찜 상태면 200으로 응답
 */
router.post('/:reviewId(\\d+)', authenticateToken, favoriteItemReviewController.addFavorite);

/**
 * PUT /favorite-item-reviews/:reviewId
 * 찜 상태 멱등 토글 — body: { liked: boolean }
 * liked=true → 찜, liked=false → 해제
 */
router.put('/:reviewId(\\d+)', authenticateToken, favoriteItemReviewController.setFavorite);

/**
 * DELETE /favorite-item-reviews/:reviewId
 * 찜 해제(비활성화)
 */
router.delete('/:reviewId(\\d+)', authenticateToken, favoriteItemReviewController.removeFavorite);

export default router;

/**
 * (선택) 전역 별칭 라우트 등록 헬퍼
 * 기존 프론트 계약 유지가 필요하면 app 레벨에서 아래 함수를 호출해 등록하세요.
 *   app.put('/item-reviews/:reviewId/like', ...)  // 찜
 *   app.delete('/item-reviews/:reviewId/like', ...) // 해제
 */
export const mountLikeAliases = (app: import('express').Express) => {
  app.put(
    '/item-reviews/:reviewId(\\d+)/like',
    authenticateToken,
    favoriteItemReviewController.setLikeTrue
  );
  app.delete(
    '/item-reviews/:reviewId(\\d+)/like',
    authenticateToken,
    favoriteItemReviewController.setLikeFalse
  );
};
