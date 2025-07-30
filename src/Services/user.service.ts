import checklistRepository from "../Repositories/checklist.repository.js";
import reviewsRepository from "../Repositories/reviews.repository.js";
import checklistItemsRepository from "../Repositories/checklistItems.repository.js";
import { Checklist } from "../types/checklist.js";

class userService {
  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await checklistRepository.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await checklistRepository.deleteChecklist(checklistId);
  }

  async getAllReviewsByUserId(userId: number) {
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

  async getChecklistsByUserId(userId: number) {
    const checklists = await checklistRepository.getChecklistsByUserId(userId);
    return checklists;
  }

  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await checklistRepository.getChecklistByChecklistId(
      userId,
      checklistId
    );

    if (!checklist) {
      throw new Error("Not Found");
    }

    const { cities, ...flatChecklist } = checklist;
    const flatChecklistWithCity = {
      ...flatChecklist,
      city: cities.cityName,
    };

    const items = await checklistItemsRepository.getChecklistItems(checklistId);
    const itemRes = items.map((item) => ({
      itemLabel: item.item.itemLabel,
      packingBag: item.packingBag,
    }));

    const res = { ...flatChecklistWithCity, items: itemRes };
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
    return checklist;
  }
}

export default new userService();
