import prisma from "../lib/prisma.js";

class RecommendationRepository {
  async getRecommendedItemIds(options: string[]) {
    try {
      return await prisma.itemCondition.findMany({
        select: {
          itemConditionId: false,
          conditionValue: false,
          item: {
            select: {
              categoryId: true,
              itemId: true,
              itemLabel: true,
            },
          },
        },
        where: {
          conditionValue: {
            in: options,
          },
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}

export default RecommendationRepository;
