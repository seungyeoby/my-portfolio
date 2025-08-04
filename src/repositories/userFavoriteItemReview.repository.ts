import prisma from '../lib/prisma.js';

export class FavoriteItemReviewRepository {
  async createFavorite(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.create({
      data: { userId, reviewId }
    });
  }

 async detailFavorite(userId: number, reviewId: number) {
    return await prisma.userFavoriteItemReview.findUnique({
      where: {
        userId_reviewId: {
          userId,
          reviewId,
        },
      },
      include: {
        itemReview: {
          include: {
            user: { select: { nickname: true, profilePhoto: true } },
            item: { include: { itemCategory: true } },
            checklist: { select: { title: true, travelStart: true, travelEnd: true } }
          },
        },
      },
    });
  }

  async deleteFavorite(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.delete({
      where: { userId_reviewId: { userId, reviewId } }
    });
  }

  async findAllFavorites(userId: number) {
    return prisma.userFavoriteItemReview.findMany({
      where: { userId },
      include: {
        itemReview: {
          include: { user: true, item: true }
        }
      }
    });
  }
}

export default FavoriteItemReviewRepository;