import prisma from "../utils/prisma/index.js";

class ItemsRepository {
  async getItems() {
    try {
      return await prisma.itemCategory.findMany({
        include: {
          items: {
            select: {
              itemId: true,
              itemLabel: true,
            },
          },
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async getItemsByClickCountDesc() {
    try {
      return await prisma.item.findMany({
        where: {
          itemConditions: {
            none: {
              conditionValue: "non-ranking",
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

export default new ItemsRepository();
