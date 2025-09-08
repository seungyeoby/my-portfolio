// modules/favoriteItemReview/favoriteItemReview.service.ts
import { FavoriteItemReviewRepository } from '../../repositories/userFavoriteItemReview.repository.js';

export type FavoriteItemReviewListDto = {
  reviewId: number;
  title: string;
  author: string;
  category: string;
  likes: number;
  createdAt: Date | null;
  favoritedAt: Date;
};

export class FavoriteItemReviewService {
  private repo = new FavoriteItemReviewRepository();

  /** row(즐겨찾기+조인)를 목록 DTO로 평탄화 */
  private toListDto = (row: any): FavoriteItemReviewListDto => {
    const r = row?.itemReview ?? {};
    const item = r?.item ?? {};
    const cat = item?.itemCategory ?? {};
    const user = r?.user ?? {};

    return {
      reviewId: Number(r.reviewId ?? row.reviewId),
      title: String(item.itemLabel ?? r.title ?? ''),
      author: String(user.nickname ?? ''),
      category: String(cat.categoryLabel ?? ''),
      likes: Number(r.likes ?? 0),
      createdAt: r.createdAt ?? null,
      favoritedAt: row.favoritedAt,
    };
  };

  /**
   * desired=true → 좋아요(생성/복구 + likes 증가)
   * desired=false → 해제(소프트삭제 + likes 감소)
   * 멱등 보장: 현재 상태가 desired와 같으면 카운터만 조회해 반환
   */
  async setFavorite(userId: number, reviewId: number, desired: boolean) {
    return this.repo.$transaction(async (tx) => {
      const existing = await this.repo.findFavorite(tx, userId, reviewId); // 활성/비활성 모두
      const isActive = !!(existing && existing.deletedAt == null);

      // 이미 원하는 상태면 likes만 읽어서 반환(멱등)
      if (isActive === desired) {
        const likes = await this.repo.getLikes(tx, reviewId);
        return { liked: desired, likes };
      }

      if (desired) {
        // 생성 or 복구 후 likes++
        if (!existing) await this.repo.createFavorite(tx, userId, reviewId);
        else await this.repo.restoreFavorite(tx, existing.favoriteId);
        const likes = await this.repo.incrementLikes(tx, reviewId);
        return { liked: true, likes };
      } else {
        // 활성 상태였으면 소프트삭제 + likes--
        if (existing && existing.deletedAt == null) {
          await this.repo.softDeleteFavorite(tx, existing.favoriteId);
          const likes = await this.repo.decrementLikes(tx, reviewId);
          return { liked: false, likes };
        }
        // 이미 해제 상태면 카운터만 조회
        const likes = await this.repo.getLikes(tx, reviewId);
        return { liked: false, likes };
      }
    });
  }

  /** 내 즐겨찾기 목록 (카테고리/작성자/제목 포함된 DTO로 반환) */
  async getFavorites(userId: number): Promise<FavoriteItemReviewListDto[]> {
    const rows = await this.repo.findAllFavorites(userId); // repo에서 조인/선택 완료
    return rows.map(this.toListDto);
  }

  /** 특정 리뷰가 내 즐겨찾기인지 확인 + 상세 DTO 반환 */
  async getFavoriteById(userId: number, reviewId: number): Promise<FavoriteItemReviewListDto> {
    const favorite = await this.repo.findActiveFavoriteForUser(userId, reviewId);
    if (!favorite) throw new Error('NotFavorite');

    // soft-delete 된 리뷰 방어
    const review = favorite.itemReview;
    if (!review || (review as any).deletedAt) throw new Error('ItemReviewDeleted');

    return this.toListDto(favorite);
  }
}

export default FavoriteItemReviewService;
