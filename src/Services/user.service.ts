import checklistRepository from "../Repositories/checklist.repository.js";
import reviewsRepository from "../Repositories/reviews.repository.js";
import checklistItemsRepository from "../Repositories/checklistItems.repository.js";
import userRepository from "../Repositories/user.repository.js";
import { Checklist } from "../types/checklist.js";
import { Change } from "../types/change.js";
import { PackingBag } from "@prisma/client";

class userService {
  // 개인정보 조회
  async getPublicPersonalInfo(userId: number) {
    const userInfo = await userRepository.getPublicPersonalInfo(userId);
    if (!userInfo) {
      throw new Error("UserNotFound");
    }
    const { password, userId: _, ...publicUserInfo } = userInfo;
    return publicUserInfo;
  }

  // 체크리스트 생성
  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await checklistRepository.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await checklistRepository.deleteChecklist(checklistId);
  }

  async getAllReviews(userId: number) {
    const reviews = await reviewsRepository.getAllReviewsByUserId(userId);
    return reviews;
  }

  async getReviewByReviewId(userId: number, reviewId: number) {
    const review = await reviewsRepository.getReviewByReviewId(
      userId,
      reviewId
    );
    if (!review) {
      throw new Error("NotFound");
    }
    return review;
  }

  // 전체 체크리스트 조회
  async getChecklistsByUserId(userId: number) {
    const checklists = await checklistRepository.getChecklistsByUserId(userId);
    return checklists;
  }

  // 개별 체크리스트 조회
  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await checklistRepository.getChecklistByChecklistId(
      userId,
      checklistId
    );

    if (!checklist) {
      throw new Error("NotFound");
    }

    const { cities, ...flatChecklist } = checklist;
    const flatChecklistWithCity = {
      ...flatChecklist,
      city: cities.cityName,
    };

    const items = await checklistItemsRepository.getChecklistItems(checklistId);
    const itemRes = items.map((item) => ({
      checklistItemId: item.checklistItemId,
      itemId: item.item.itemId,
      itemLabel: item.item.itemLabel,
      packingBag: item.packingBag,
    }));

    const res = { ...flatChecklistWithCity, itemRes };
    return res;
  }

  async getSharedChecklists(userId: number) {
    const checklists = await checklistRepository.getSharedChecklistsByUserId(
      userId
    );
    return checklists;
  }

  async getSharedChecklist(userId: number, checklistId: number) {
    const checklist = await checklistRepository.getSharedChecklistByChecklistId(
      userId,
      checklistId
    );

    if (!checklist) {
      throw new Error("NotFound");
    }

    return checklist;
  }

  // 체크리스트 수정
  async updateChecklist(checklistId: number, change: Change) {
    if (change.addedItems.length) {
      await checklistItemsRepository.addNewChecklistItems(
        change.addedItems,
        checklistId
      );
    }

    if (change.removedItems.length) {
      await checklistItemsRepository.removeChecklistItems(change.removedItems);
    }

    if (change.packingBagChangedItems.length) {
      const beforeStatus =
        await checklistItemsRepository.getChecklistItemsByChecklistItemId(
          change.packingBagChangedItems
        );
      const updates = beforeStatus.map(({ checklistItemId, packingBag }) => ({
        id: checklistItemId,
        newValue:
          packingBag === PackingBag.HAND ? PackingBag.HOLD : PackingBag.HAND,
      }));
      await checklistItemsRepository.updatePackingBag(updates);
    }
  }
}

export default new userService();
