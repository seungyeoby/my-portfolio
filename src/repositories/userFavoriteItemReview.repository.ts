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
    async increaseLikes(reviewId: number) {
    return prisma.itemReview.update({
      where: { reviewId },
      data: { likes: { increment: 1 } }
    });
  }

  async decreaseLikes(reviewId: number) {
    return prisma.itemReview.update({
      where: { reviewId },
      data: { likes: { decrement: 1 } }
    });
  }

  async findByReviewId(reviewId: number) {
    return prisma.itemReview.findUnique({
      where: { reviewId },
      include: {
        user: { select: { nickname: true, profilePhoto: true } },
        item: { include: { itemCategory: true } },
        checklist: { select: { title: true, travelStart: true, travelEnd: true } }
      }
    }).then((review) => {
    // 직접 deletedAt이 null인지 확인 (Prisma는 findUnique에서 복합 조건 안 됨)
    if (!review || review.deletedAt) return null;
    return review;
  });;
  }
}

export default FavoriteItemReviewRepository;