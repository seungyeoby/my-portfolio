// src/repositories/checklist.repository.ts
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import { Item, ChecklistDTO } from "../types/checklist.js";

export default class ChecklistsRepository {
  /** 체크리스트 + 아이템 저장 → 생성된 checklistId 반환 */
  async saveChecklist(items: Item[], checklistInfo: ChecklistDTO): Promise<number> {
    try {
      const createdId = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const newChecklist = await tx.checklist.create({ data: checklistInfo });

        if (items?.length) {
          await tx.checklistItem.createMany({
            data: items.map((it) => ({
              checklistId: newChecklist.checklistId,
              itemId: it.itemId,
              packingBag: it.packingBag, // 'HAND' | 'HOLD'
            })),
          });
        }

        return newChecklist.checklistId;
      });

      return createdId;
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 체크리스트 soft-delete (본체 + 아이템) */
  async deleteChecklist(checklistId: number) {
    try {
      await prisma.$transaction(async (tx) => {
        await tx.checklist.update({
          where: { checklistId },
          data: { deletedAt: new Date() },
        });

        await tx.checklistItem.updateMany({
          where: { checklistId },
          data: { deletedAt: new Date() },
        });
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 내 체크리스트 목록 (도시명 포함) */
  async getChecklistsByUserId(userId: number) {
    try {
      return await prisma.checklist.findMany({
        where: { userId, deletedAt: null },
        select: {
          checklistId: true,
          title: true,
          travelType: true,
          travelStart: true,
          travelEnd: true,
          createdAt: true,
          cities: { select: { cityName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 개별 체크리스트 헤더용 메타 (내 것만) */
  async getChecklistByChecklistId(userId: number, checklistId: number) {
    try {
      return await prisma.checklist.findFirst({
        where: { checklistId, userId, deletedAt: null },
        select: {
          checklistId: true,
          title: true,
          travelType: true,
          travelStart: true,
          travelEnd: true,
          createdAt: true,
          cities: { select: { cityName: true } },
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 내가 공유한 체크리스트 목록 */
  async getSharedChecklistsByUserId(userId: number) {
    try {
      return await prisma.checklist.findMany({
        where: { userId, isShared: true, deletedAt: null },
        select: {
          checklistId: true,
          title: true,
          travelType: true,
          travelStart: true,
          travelEnd: true,
          createdAt: true,
          likes: true,
          content: true,
          cities: { select: { cityName: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 공개 체크리스트 상세 (공유됨 + 미삭제) */
  async getSharedChecklistByChecklistId(checklistId: number) {
    try {
      return await prisma.checklist.findFirst({
        where: { checklistId, isShared: true, deletedAt: null },
        include: {
          user: { select: { nickname: true, profilePhoto: true } },
          cities: true,
          checklistItems: {
            include: { item: { include: { itemCategory: true } } },
          },
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 공유 on/off */
  async shareChecklist(checklistId: number) {
    try {
      return await prisma.checklist.update({
        where: { checklistId },
        data: { isShared: true },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }
  async unshareChecklist(checklistId: number) {
    try {
      return await prisma.checklist.update({
        where: { checklistId },
        data: { isShared: false },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 단순 단건 조회 */
  async findChecklistByChecklistId(checklistId: number) {
    try {
      return await prisma.checklist.findUnique({ where: { checklistId } });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 공개 체크리스트 단건 (필터 포함) */
  async getSharedChecklistById(checklistId: number) {
    try {
      return await prisma.checklist.findFirst({
        where: { checklistId, isShared: true, deletedAt: null },
        include: {
          user: { select: { nickname: true, profilePhoto: true } },
          cities: true,
          checklistItems: {
            include: { item: { include: { itemCategory: true } } },
          },
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }

  /** 공개 체크리스트 전체 (정렬: recent | likes) */
  async getAllSharedChecklists(sort: string) {
    try {
      return await prisma.checklist.findMany({
        where: { isShared: true, deletedAt: null },
        orderBy: sort === "recent" ? { createdAt: "desc" } : { likes: "desc" },
        include: {
          user: { select: { nickname: true, profilePhoto: true } },
          cities: true,
        },
      });
    } catch (e) {
      throw new Error("DatabaseError");
    }
  }
}
