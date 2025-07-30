import prisma from "../lib/prisma.js";

class ChecklistItemsRepository {
  async getChecklistItems(checklistId: number) {
    try {
      return await prisma.checklistItem.findMany({
        where: { checklistId, removedByUser: false },
        select: {
          checklistItemId: true,
          packingBag: true,
          item: {
            select: {
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

export default ChecklistItemsRepository;
