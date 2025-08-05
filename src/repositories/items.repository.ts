import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export default class ItemsRepository {
  async getItemsByClickCountDesc() {
    try {
      return await prisma.item.findMany({
        where: {
          itemConditions: {
            none: {
              conditionValue: "nonRanking",
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

  async upClickCount(itemIds: number[]) {
    try {
      await prisma.$executeRaw`
        UPDATE items
        SET click_count = click_count + 1
        WHERE item_id IN (${Prisma.join(itemIds)})
      `;
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}
