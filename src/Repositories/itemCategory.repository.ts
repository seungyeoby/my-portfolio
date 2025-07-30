import prisma from "../lib/prisma.js";

class ItemCategoryRepository {
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

export default ItemCategoryRepository;
