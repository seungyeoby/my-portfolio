import prisma from "../lib/prisma.js";

class ItemsRepository {
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

export default ItemsRepository;
