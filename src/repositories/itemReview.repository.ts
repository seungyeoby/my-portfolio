import prisma from "../lib/prisma.js";

export default class itemReviewRepository {
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

   async create(data: CreateItemReviewInput) {
    return prisma.itemReview.create({ data });
  }

  async findAll(query: ReviewQuery) {
    const { sort = 'likes', categoryId } = query;

    const orderBy: Prisma.ItemReviewOrderByWithRelationInput =
      sort === 'recent' ? { createdAt: 'desc' } : { likes: 'desc' };

    const where: Prisma.ItemReviewWhereInput = {
      deletedAt: null,
      ...(categoryId ? { item: { categoryId: parseInt(categoryId) } } : {})
    };

    return prisma.itemReview.findMany({
      where,
      orderBy,
      include: {
        user: { select: { nickname: true, profilePhoto: true } },
        item: { include: { itemCategory: true } },
      }
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

  async update(reviewId: number, data: UpdateItemReviewInput) {
    return prisma.itemReview.update({ where: { reviewId }, data });
  }

  async softDelete(reviewId: number) {
    return prisma.itemReview.update({
      where: { reviewId },
      data: { deletedAt: new Date() }
    });
  }

  async findFavorite(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.findUnique({
      where: { userId_reviewId: { userId, reviewId } }
    });
  }

  async addFavorite(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.create({
      data: { userId, reviewId }
    });
  }

  async removeFavorite(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.delete({
      where: { userId_reviewId: { userId, reviewId } }
    });
  }

}
