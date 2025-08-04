import prisma from "../lib/prisma.js";

export default class ItemConditionRepository {
  async getRecommendedItemIds(options: string[]) {
    try {
      return await prisma.itemCondition.findMany({
        select: {
          item: {
            select: {
              itemId: true,
              itemLabel: true,
              itemCategory: {
                select: {
                  categoryLabel: true,
                },
              },
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
