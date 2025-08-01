import prisma from "../lib/prisma.js";
import { UpdatedUserInfo } from "../types/publicUserInfo.js";

export default class UserRepository {
  async getPublicPersonalInfo(userId: number) {
    try {
      return await prisma.user.findFirst({
        where: {
          userId,
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async updatePersonalInfo(userId: number, updatedInfo: UpdatedUserInfo) {
    try {
      return await prisma.user.update({
        where: { userId },
        data: { ...updatedInfo },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}
