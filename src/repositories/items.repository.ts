import prisma from "../lib/prisma.js";

export default class ItemsRepository {
  async getItemsByClickCountDesc() {
    try {
      return await prisma.item.findMany({
        where: {
          itemConditions: {
            none: {
              conditionValue: "nonRanking",
            },
          },
        },
        orderBy: {
          clickCount: "desc",
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}
