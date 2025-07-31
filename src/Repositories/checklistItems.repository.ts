import { PackingBag } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { Change } from "../types/change.js";

class ChecklistItemsRepository {
  async getChecklistItems(checklistId: number) {
    try {
      return await prisma.checklistItem.findMany({
        where: { checklistId, removedByUser: false, deletedAt: null },
        select: {
          checklistItemId: true,
          packingBag: true,
          item: {
            select: {
              itemLabel: true,
              itemId: true,
            },
          },
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async getChecklistItemsByChecklistItemId(ids: number[]) {
    try {
      return await prisma.checklistItem.findMany({
        where: { checklistItemId: { in: ids } },
        select: { checklistItemId: true, packingBag: true },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async addNewChecklistItems(
    newItems: Change["addedItems"],
    checklistId: number
  ) {
    try {
      await prisma.checklistItem.createMany({
        data: newItems.map((it) => ({
          checklistId: checklistId,
          itemId: it.itemId,
          packingBag: it.packingBag,
        })),
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async removeChecklistItems(removedItems: Change["removedItems"]) {
    try {
      await prisma.checklistItem.updateMany({
        where: {
          checklistItemId: {
            in: removedItems,
          },
        },
        data: {
          removedByUser: true,
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async updatePackingBag(
    packingBagChangedItems: { id: number; newValue: PackingBag }[]
  ) {
    try {
      await prisma.$transaction(
        packingBagChangedItems.map(({ id, newValue }) =>
          prisma.checklistItem.update({
            where: { checklistItemId: id },
            data: { packingBag: newValue },
          })
        )
      );
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}

export default new ChecklistItemsRepository();
