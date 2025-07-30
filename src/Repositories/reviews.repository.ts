import prisma from "../lib/prisma.js";

class ReviewsRepository {
  async getAllReviewsByUserId(userId: number) {
    try {
      return await prisma.itemReview.findMany({
        select: {
          reviewId: true,
          title: true,
          content: true,
          likes: true,
          createdAt: true,
          checklist: {
            select: {
              title: true,
            },
          },
          item: {
            select: {
              itemLabel: true,
              itemCategory: {
                select: {
                  categoryId: true,
                  categoryLabel: true,
                },
              },
            },
          },
        },
        where: { userId, deletedAt: null },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async getReviewByReviewId(userId: number, reviewId: number) {
    try {
      return await prisma.itemReview.findFirst({
        select: {
          reviewId: true,
          title: true,
          content: true,
          image: true,
          likes: true,
          createdAt: true,
          checklist: {
            select: {
              title: true,
            },
          },
          item: {
            select: {
              itemLabel: true,
              itemCategory: {
                select: {
                  categoryId: true,
                  categoryLabel: true,
                },
              },
            },
          },
        },
        where: { userId, reviewId, deletedAt: null },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}

export default ReviewsRepository;
