import { FavoriteItemReviewRepository } from '../../repositories/userFavoriteItemReview.repository.js';

export class FavoriteItemReviewService {
  private repo = new FavoriteItemReviewRepository();

  async addFavorite(userId: number, reviewId: number) {
    try {
      const existing = await this.repo.detailFavorite(userId, reviewId);
      if (existing) throw new Error('AlreadyFavorite');
      return await this.repo.createFavorite(userId, reviewId);
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
      return await this.repo.deleteFavorite(userId, reviewId);
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
