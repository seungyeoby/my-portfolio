import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { Checklist, Item } from "../types/checklist.js";

export default class ChecklistsRepository {
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
        await tx.checklist.update({
          where: { checklistId },
          data: {
            deletedAt: new Date(),
          },
        });

        await tx.checklistItem.updateMany({
          where: { checklistId },
          data: {
            deletedAt: new Date(),
          },
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
          content: true,
          isShared: true,
          likes: true,
          updatedAt: true,
          deletedAt: true,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  async getChecklistByChecklistId(userId: number, checklistId: number) {
    try {
      return await prisma.checklist.findFirst({
        where: { checklistId, userId, deletedAt: null },
        select: {
          checklistId: true,
          title: true,
          travelType: true,
          cities: {
            select: {
              cityName: true,
            },
          },
          travelStart: true,
          travelEnd: true,
          createdAt: true,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  async getSharedChecklistsByUserId(userId: number) {
    try {
      return await prisma.checklist.findMany({
        select: {
          checklistId: true,
          title: true,
          cityId: true,
          travelType: true,
          travelStart: true,
          travelEnd: true,
          createdAt: true,
          content: true,
          likes: true,
        },
        where: {
          userId,
          isShared: true,
          deletedAt: null,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  async getSharedChecklistByChecklistId(userId: number, checklistId: number) {
    try {
      return await prisma.checklist.findFirst({
        select: {
          checklistId: true,
          title: true,
          cityId: true,
          travelType: true,
          travelStart: true,
          travelEnd: true,
          createdAt: true,
          content: true,
          likes: true,
          checklistItems: {
            select: {
              item: {
                select: {
                  itemLabel: true,
                },
              },
              packingBag: true,
            },
          },
        },
        where: {
          userId,
          isShared: true,
          checklistId,
          deletedAt: null,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }
}
