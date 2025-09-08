// modules/favoriteItemReview/favoriteItemReview.controller.ts
import { Request, Response, NextFunction } from 'express';
import { FavoriteItemReviewService } from './favoriteItemReview.service.js';

class FavoriteItemReviewController {
  private service = new FavoriteItemReviewService();

  // 유틸: reviewId 파싱/검증
  private parseReviewId(req: Request, res: Response): number | null {
    const reviewId = Number(req.params.reviewId);
    if (!Number.isFinite(reviewId) || reviewId <= 0) {
      res.status(400).json({ message: '유효하지 않은 reviewId 입니다.' });
      return null;
    }
    return reviewId;
  }

  // ────────────────────────────── 즐겨찾기 생성(찜)
  // POST /favorite-item-reviews/:reviewId
  addFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    try {
      const { liked, likes } = await this.service.setFavorite(userId, reviewId, true);
      // 이미 찜 상태였던 경우에도 멱등 처리
      return res.status(liked ? 201 : 200).json({ liked, likes, reviewId, message: liked ? '찜 완료' : '이미 찜됨' });
    } catch (error: any) {
      // Prisma: 연결 대상이 없음
      if (error?.code === 'P2025') return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
      next(error);
    }
  };

  // ────────────────────────────── 즐겨찾기 해제
  // DELETE /favorite-item-reviews/:reviewId
  removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    try {
      const { liked, likes } = await this.service.setFavorite(userId, reviewId, false);
      return res.status(200).json({ liked, likes, reviewId, message: '찜 취소' });
    } catch (error: any) {
      if (error?.code === 'P2025') return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
      next(error);
    }
  };

  // ────────────────────────────── 멱등 토글(원클릭 토글이 아닌, 상태 지정)
  // PUT /favorite-item-reviews/:reviewId   body: { liked: boolean }
  setFavorite = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    const desired = typeof req.body?.liked === 'boolean' ? Boolean(req.body.liked) : null;
    if (desired === null) {
      return res.status(400).json({ message: 'liked(boolean) 값을 body로 전달하세요.' });
    }

    try {
      const { liked, likes } = await this.service.setFavorite(userId, reviewId, desired);
      return res.status(200).json({ liked, likes, reviewId });
    } catch (error: any) {
      if (error?.code === 'P2025') return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
      next(error);
    }
  };

  // ────────────────────────────── 목록
  // GET /favorite-item-reviews
  getFavorites = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    try {
      const rows = await this.service.getFavorites(userId);
      // 프론트가 배열/혹은 data 배열 모두 처리 가능하도록 배열 그대로 반환
      return res.status(200).json(rows);
      // 또는 감싸고 싶다면: return res.status(200).json({ data: rows });
    } catch (error) {
      next(error);
    }
  };

  // ────────────────────────────── 단건
  // GET /favorite-item-reviews/:reviewId
  getFavoriteById = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    try {
      const dto = await this.service.getFavoriteById(userId, reviewId);
      return res.status(200).json(dto);
      // 또는 감싸기: return res.status(200).json({ data: dto });
    } catch (error: any) {
      if (error?.message === 'NotFavorite') return res.status(404).json({ message: '찜하지 않은 항목' });
      if (error?.message === 'ItemReviewDeleted') return res.status(410).json({ message: '삭제된 리뷰' });
      next(error);
    }
  };

  // ────────────────────────────── 별칭 (프론트 기존 계약 호환)
  // PUT /item-reviews/:reviewId/like    → liked=true
  setLikeTrue = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    try {
      const { liked, likes } = await this.service.setFavorite(userId, reviewId, true);
      return res.status(200).json({ liked, likes, reviewId });
    } catch (error) {
      next(error);
    }
  };

  // DELETE /item-reviews/:reviewId/like → liked=false
  setLikeFalse = async (req: Request, res: Response, next: NextFunction) => {
    const userId: number = req.user!.userId;
    const reviewId = this.parseReviewId(req, res);
    if (reviewId == null) return;

    try {
      const { liked, likes } = await this.service.setFavorite(userId, reviewId, false);
      return res.status(200).json({ liked, likes, reviewId });
    } catch (error) {
      next(error);
    }
  };
}

export default new FavoriteItemReviewController();
