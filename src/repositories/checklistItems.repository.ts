import { PackingBag } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { ChangedChecklistItems } from "../types/checklist.js";

export default class ChecklistItemsRepository {
  /**
   * 체크리스트의 아이템(삭제/제거 제외) 조회
   */
  async getChecklistItems(checklistId: number) {
    try {
      return await prisma.checklistItem.findMany({
        where: { checklistId, removedByUser: false, deletedAt: null },
        select: {
          checklistItemId: true,
          packingBag: true,
          item: { select: { itemLabel: true, itemId: true } },
        },
        orderBy: { checklistItemId: "asc" },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /**
   * 여러 checklistItemId의 현재 상태 조회
   */
  async getChecklistItemsByChecklistItemId(ids: number[]) {
    try {
      return await prisma.checklistItem.findMany({
        where: { checklistItemId: { in: ids } },
        select: { checklistItemId: true, packingBag: true },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /**
   * 아이템 추가 (createMany)
   */
  async addNewChecklistItems(
    newItems: ChangedChecklistItems["addedItems"],
    checklistId: number
  ) {
    try {
      if (!newItems?.length) return;

      await prisma.checklistItem.createMany({
        data: newItems.map((it) => ({
          checklistId,
          itemId: it.itemId,
          packingBag: it.packingBag,
        })),
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /**
   * 아이템 제거 (soft remove: removedByUser=true)
   */
  async removeChecklistItems(removedItems: ChangedChecklistItems["removedItems"]) {
    try {
      if (!removedItems?.length) return;

      await prisma.checklistItem.updateMany({
        where: { checklistItemId: { in: removedItems } },
        data: { removedByUser: true },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /**
   * 포장 위치(HAND/HOLD) 일괄 변경
   */
  async updatePackingBag(
    packingBagChangedItems: { id: number; newValue: PackingBag }[]
  ) {
    try {
      if (!packingBagChangedItems?.length) return;

      await prisma.$transaction(
        packingBagChangedItems.map(({ id, newValue }) =>
          prisma.checklistItem.update({
            where: { checklistItemId: id },
            data: { packingBag: newValue },
          })
        )
      );
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }
}
