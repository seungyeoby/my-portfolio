import type UserRepository from "../Repositories/user.repository.js";
import type ChecklistItemsRepository from "../Repositories/checklistItems.repository.js";
import type ReviewsRepository from "../Repositories/reviews.repository.js";
import type ChecklistsRepository from "../Repositories/checklist.repository.js";
import { Checklist, ChangedChecklistItems } from "../types/checklist.js";
import { UpdatedUserInfo } from "../types/publicUserInfo.js";
import { PackingBag } from "@prisma/client";

export default class UserService {
  constructor(
    private userRepo: UserRepository,
    private checklistItemsRepo: ChecklistItemsRepository,
    private checklistsRepo: ChecklistsRepository,
    private reviewsRepo: ReviewsRepository
  ) {}
  // 개인정보 조회
  async getPublicPersonalInfo(userId: number) {
    const userInfo = await this.userRepo.getPublicPersonalInfo(userId);
    if (!userInfo) {
      throw new Error("UserNotFound");
    }
    const { password, userId: _, ...publicUserInfo } = userInfo;
    return publicUserInfo;
  }

  // 개인정보 수정
  async updatePersonalInfo(userId: number, updatedInfo: UpdatedUserInfo) {
    if (updatedInfo.birthDate) {
      updatedInfo.birthDate = new Date(updatedInfo.birthDate);
    }

    const updatedUser = await this.userRepo.updatePersonalInfo(
      userId,
      updatedInfo
    );
    const { password, userId: _, ...publicUserInfo } = updatedUser;
    return publicUserInfo;
  }

  // 체크리스트 생성
  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await this.checklistsRepo.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await this.checklistsRepo.deleteChecklist(checklistId);
  }

  async getAllReviews(userId: number) {
    const reviews = await this.reviewsRepo.getAllReviewsByUserId(userId);
    return reviews;
  }

  async getReviewByReviewId(userId: number, reviewId: number) {
    const review = await this.reviewsRepo.getReviewByReviewId(userId, reviewId);
    if (!review) {
      throw new Error("NotFound");
    }
    return review;
  }

  // 전체 체크리스트 조회
  async getChecklistsByUserId(userId: number) {
    const checklists = await this.checklistsRepo.getChecklistsByUserId(userId);
    return checklists;
  }

  // 개별 체크리스트 조회
  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await this.checklistsRepo.getChecklistByChecklistId(
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

    const items = await this.checklistItemsRepo.getChecklistItems(checklistId);
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
    const checklists = await this.checklistsRepo.getSharedChecklistsByUserId(
      userId
    );
    return checklists;
  }

  async getSharedChecklist(userId: number, checklistId: number) {
    const checklist = await this.checklistsRepo.getSharedChecklistByChecklistId(
      userId,
      checklistId
    );

    if (!checklist) {
      throw new Error("NotFound");
    }

    return checklist;
  }

  // 체크리스트 수정
  async updateChecklist(checklistId: number, change: ChangedChecklistItems) {
    if (change.addedItems.length) {
      await this.checklistItemsRepo.addNewChecklistItems(
        change.addedItems,
        checklistId
      );
    }

    if (change.removedItems.length) {
      await this.checklistItemsRepo.removeChecklistItems(change.removedItems);
    }

    if (change.packingBagChangedItems.length) {
      const beforeStatus =
        await this.checklistItemsRepo.getChecklistItemsByChecklistItemId(
          change.packingBagChangedItems
        );
      const updates = beforeStatus.map(({ checklistItemId, packingBag }) => ({
        id: checklistItemId,
        newValue:
          packingBag === PackingBag.HAND ? PackingBag.HOLD : PackingBag.HAND,
      }));
      await this.checklistItemsRepo.updatePackingBag(updates);
    }
  }
}
