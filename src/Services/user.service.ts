import ChecklistRepository from "../Repositories/checklist.repository.js";
import ReviewsRepository from "../Repositories/reviews.repository.js";
import ChecklistItemsRepository from "../Repositories/checklistItems.repository.js";
import UserRepository from "../Repositories/user.repository.js";
import { Checklist } from "../types/checklist.js";
import { Change } from "../types/change.js";
import { PackingBag } from "@prisma/client";

class userService {
  private checklistRepo: ChecklistRepository;
  private reviewRepo: ReviewsRepository;
  private checklistItemsRepo: ChecklistItemsRepository;
  private userRepo: UserRepository;

  constructor() {
    this.checklistRepo = new ChecklistRepository();
    this.reviewRepo = new ReviewsRepository();
    this.checklistItemsRepo = new ChecklistItemsRepository();
    this.userRepo = new UserRepository();
  }

  // 개인정보 조회
  async getPublicPersonalInfo(userId: number) {
    const userInfo = await this.userRepo.getPublicPersonalInfo(userId);
    if (!userInfo) {
      throw new Error("UserNotFound");
    }
    const { password, userId: _, ...publicUserInfo } = userInfo;
    return publicUserInfo;
  }

  // 체크리스트 생성
  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await this.checklistRepo.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await this.checklistRepo.deleteChecklist(checklistId);
  }

  async getAllReviews(userId: number) {
    const reviews = await this.reviewRepo.getAllReviewsByUserId(userId);
    return reviews;
  }

  async getReviewByReviewId(userId: number, reviewId: number) {
    const review = await this.reviewRepo.getReviewByReviewId(userId, reviewId);
    if (!review) {
      throw new Error("NotFound");
    }
    return review;
  }

  // 전체 체크리스트 조회
  async getChecklistsByUserId(userId: number) {
    const checklists = await this.checklistRepo.getChecklistsByUserId(userId);
    return checklists;
  }

  // 개별 체크리스트 조회
  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await this.checklistRepo.getChecklistByChecklistId(
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
    const checklists = await this.checklistRepo.getSharedChecklistsByUserId(
      userId
    );
    return checklists;
  }

  async getSharedChecklist(userId: number, checklistId: number) {
    const checklist = await this.checklistRepo.getSharedChecklistByChecklistId(
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

export default new userService();
