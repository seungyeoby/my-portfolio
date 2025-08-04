import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { Item, ChecklistDTO } from "../types/checklist.js";

export default class ChecklistsRepository {
  async saveChecklist(items: Item[], checklistInfo: ChecklistDTO) {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. 체크리스트 저장
        const newChecklist = await tx.checklist.create({
          data: checklistInfo,
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
        where: {
          checklistId,
          userId,
          deletedAt: { equals: null },
        },
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
  
  async getSharedChecklistByChecklistId(checklistId: number) {
    return prisma.checklist.findUnique({
      where: {
        checklistId,
        isShared: true,
        deletedAt: null,
      },
      include: {
        user: { select: { nickname: true, profilePhoto: true } },
        cities: true,
        checklistItems: {
          include: {
            item: { include: { itemCategory: true } },
          },
        },
      },
    });
  }
  
  async shareChecklist(checklistId: number) {
    return prisma.checklist.update({
      where: { checklistId },
      data: { isShared: true },
    });
  }

  async unshareChecklist(checklistId: number) {
    return prisma.checklist.update({
      where: { checklistId },
      data: { isShared: false },
    });
  }
      async findChecklistByChecklistId(checklistId: number) {
    return prisma.checklist.findUnique({
      where: { checklistId },
    });
  }

  async getSharedChecklistById(checklistId: number) {
    return prisma.checklist.findUnique({
      where: {
        checklistId,
        isShared: true,
        deletedAt: null,
      },
      include: {
        user: { select: { nickname: true, profilePhoto: true } },
        cities: true,
        checklistItems: {
          include: {
            item: { include: { itemCategory: true } },
          },
        },
      },
    });
  }
    async getAllSharedChecklists(sort: string) {
    return prisma.checklist.findMany({
      where: {
        isShared: true,
        deletedAt: null,
      },
      orderBy: sort === 'recent' ? { createdAt: 'desc' } : { likes: 'desc' },
      include: {
        user: { select: { nickname: true, profilePhoto: true } },
        cities: true,
      },
    });
  }

}
