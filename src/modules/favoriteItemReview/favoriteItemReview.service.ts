import { FavoriteItemReviewRepository } from '../../repositories/userFavoriteItemReview.repository.js';

export class FavoriteItemReviewService {
  private repo = new FavoriteItemReviewRepository();

async addFavorite(userId: number, reviewId: number) {
  try {
    const existing = await this.repo.detailFavorite(userId, reviewId);
    if (existing) throw new Error('AlreadyFavorite');

    await this.repo.createFavorite(userId, reviewId);
    await this.repo.increaseLikes(reviewId); 

    return { liked: true, message: '찜 완료' };
  } catch (error) {
    throw new Error("DataBaseError");
  }
}

  async getFavoriteById(userId: number, reviewId: number) {
    try {
      const favorite = await this.repo.detailFavorite(userId, reviewId);
      if (!favorite) throw new Error("NotFavorite");

      const review = favorite.itemReview;
      if (!review || review.deletedAt) throw new Error("ItemReviewDeleted");

      return review;
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

async removeFavorite(userId: number, reviewId: number) {
  try {
    const existing = await this.repo.detailFavorite(userId, reviewId);
    if (!existing) throw new Error('NotFavorite');

    await this.repo.deleteFavorite(userId, reviewId);

    const review = await this.repo.findByReviewId(reviewId); // likes 확인
    if (review && review.likes > 0) {
      await this.repo.decreaseLikes(reviewId); 
    }

    return { liked: false, message: '찜 취소' };
  } catch (error) {
    throw new Error("DataBaseError");
  }
}

  async getFavorites(userId: number) {
    try {
      return await this.repo.findAllFavorites(userId);
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }
}

export default FavoriteItemReviewService;
