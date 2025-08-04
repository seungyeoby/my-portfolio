import ItemReviewRepository from '../../repositories/itemReview.repository.js';
import { CreateItemReviewInput, ReviewQuery, UpdateItemReviewInput } from '../../types/itemReview.js';

export class ItemReviewService {
  private repo = new ItemReviewRepository();

  async createItemReview(data: CreateItemReviewInput) {
    try {
      return await this.repo.create(data);
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

  async getAllItemReviews(query: ReviewQuery) {
    try {
      return await this.repo.findAll(query);
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

  async getItemReviewById(reviewId: number) {
    try {
      const review = await this.repo.findById(reviewId);
      if (!review) throw new Error('ItemReviewNotFound');
      if (review.deletedAt) throw new Error('ItemReviewDeleted');
      return review;
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

  async toggleFavorite(userId: number, reviewId: number) {
    try {
      const existing = await this.repo.findFavorite(userId, reviewId);

      if (existing) {
        await this.repo.removeFavorite(userId, reviewId);
        await this.repo.decreaseLikes(reviewId);
        return { liked: false, message: '좋아요 취소됨' };
      } else {
        await this.repo.addFavorite(userId, reviewId);
        await this.repo.increaseLikes(reviewId);
        return { liked: true, message: '좋아요 추가됨' };
      }
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

  async updateItemReview(
    reviewId: number,
    data: UpdateItemReviewInput,
    user: { userId: number; authority: string }
  ) {
    try {
      const review = await this.repo.findById(reviewId);
      if (!review) throw new Error("ItemReviewNotFound");

      const isOwner = review.userId === user.userId;
      const isAdmin = user.authority === 'ADMIN';

      if (!isOwner && !isAdmin) throw new Error("AuthenticationError");

      return await this.repo.update(reviewId, data);
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }

  async deleteItemReview(reviewId: number, user: { userId: number; authority: string }) {
    try {
      const review = await this.repo.findById(reviewId);
      if (!review || review.deletedAt) throw new Error("ItemReviewNotFound");

      const isOwner = review.userId === user.userId;
      const isAdmin = user.authority === 'ADMIN';
      if (!isOwner && !isAdmin) throw new Error("AuthenticationError");

      return await this.repo.softDelete(reviewId);
    } catch (error) {
      throw new Error("DataBaseError");
    }
  }
}
