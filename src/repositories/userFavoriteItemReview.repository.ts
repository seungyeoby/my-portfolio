// repositories/userFavoriteItemReview.repository.ts
import { Prisma, PrismaClient } from '@prisma/client';

// ⚠️ 실제 프로젝트에선 싱글톤 prisma 인스턴스를 import 해서 쓰는 걸 권장합니다.
const prisma = new PrismaClient();

export class FavoriteItemReviewRepository {
  // ───────────────── transactions
  $transaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>) {
    return prisma.$transaction(fn);
  }

  // @@unique([userId, reviewId]) 기반 단건 조회(활성/비활성 구분 X)
  findFavorite(tx: Prisma.TransactionClient, userId: number, reviewId: number) {
    return tx.userFavoriteItemReview.findUnique({
      where: { userId_reviewId: { userId, reviewId } },
    });
  }

  // 활성 즐겨찾기(= deletedAt: null) + 조인 포함
  findActiveFavoriteForUser(userId: number, reviewId: number) {
    return prisma.userFavoriteItemReview.findFirst({
      where: { userId, reviewId, deletedAt: null },
      include: {
        itemReview: {
          include: {
            user: { select: { nickname: true } }, // 작성자
            item: {
              include: {
                itemCategory: { select: { categoryLabel: true } }, // 카테고리
              },
            },
          },
        },
      },
    });
  }

  // ───────────────── create/restore/soft-delete
  createFavorite(tx: Prisma.TransactionClient, userId: number, reviewId: number) {
    return tx.userFavoriteItemReview.create({
      data: { userId, reviewId, favoritedAt: new Date(), deletedAt: null },
    });
  }

  restoreFavorite(tx: Prisma.TransactionClient, favoriteId: number) {
    return tx.userFavoriteItemReview.update({
      where: { favoriteId },
      data: { deletedAt: null, favoritedAt: new Date() },
    });
  }

  softDeleteFavorite(tx: Prisma.TransactionClient, favoriteId: number) {
    return tx.userFavoriteItemReview.update({
      where: { favoriteId },
      data: { deletedAt: new Date() },
    });
  }

  // ───────────────── likes counter helpers
  async getLikes(tx: Prisma.TransactionClient, reviewId: number) {
    const r = await tx.itemReview.findUnique({
      where: { reviewId },
      select: { likes: true },
    });
    return r?.likes ?? 0;
  }

  async incrementLikes(tx: Prisma.TransactionClient, reviewId: number) {
    const r = await tx.itemReview.update({
      where: { reviewId },
      data: { likes: { increment: 1 } },
      select: { likes: true },
    });
    return r.likes;
  }

  async decrementLikes(tx: Prisma.TransactionClient, reviewId: number) {
    const r = await tx.itemReview.update({
      where: { reviewId },
      data: { likes: { decrement: 1 } },
      select: { likes: true },
    });
    return Math.max(0, r.likes);
  }

  // ───────────────── 목록 (조인 포함) — 프런트에서 바로 category/author 사용 가능
  findAllFavorites(userId: number) {
    return prisma.userFavoriteItemReview.findMany({
      where: { userId, deletedAt: null },
      orderBy: { favoritedAt: 'desc' },
      select: {
        reviewId: true,
        favoritedAt: true,
        itemReview: {
          select: {
            reviewId: true,
            createdAt: true,
            likes: true,
            user: { select: { nickname: true } },                // 작성자
            item: {
              select: {
                itemLabel: true,                                  // 물품명
                itemCategory: { select: { categoryLabel: true } } // 카테고리
              },
            },
          },
        },
      },
    });
  }

  // (옵션) likes만 필요할 때
  findByReviewId(reviewId: number) {
    return prisma.itemReview.findUnique({
      where: { reviewId },
      select: { reviewId: true, likes: true },
    });
  }
}

export default FavoriteItemReviewRepository;
