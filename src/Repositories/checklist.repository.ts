import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { Checklist, Item } from "../types/checklist.js";

class ChecklistRepository {
  async saveChecklist(items: Item[], checklistInfo: Omit<Checklist, "items">) {
    try {
      const parsedChecklistInfo = {
        ...checklistInfo,
        travelStart: new Date(checklistInfo.travelStart),
        travelEnd: new Date(checklistInfo.travelEnd),
      };

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 체크리스트 저장
        const newChecklist = await tx.checklist.create({
          data: parsedChecklistInfo,
        });

        // 2. 아이템 저장
        for (const item of items) {
          await tx.checklistItem.create({
            data: {
              checklistId: newChecklist.checklistId,
              itemId: item.itemId,
              packingBag: item.packingBag,
            },
          });
        }
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async deleteChecklist(checklistId: number) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. checklist soft-delete (deleted_at 업데이트)
        await tx.checklist.update({
          where: { checklistId },
          data: {
            deletedAt: new Date(), // 현재 시간 기록
          },
        });

        // 2. checklistItem 하드 삭제
        await tx.checklistItem.deleteMany({
          where: { checklistId },
        });
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  async getChecklistsByUserId(userId: number) {
    try {
      return await prisma.checklist.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        omit: {
          isShared: true,
          likes: true,
          updatedAt: true,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }
}

export default new ChecklistRepository();
