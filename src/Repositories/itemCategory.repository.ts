import prisma from "../lib/prisma.js";

export default class ItemCategoryRepository {
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
}
