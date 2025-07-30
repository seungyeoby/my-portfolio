import ChecklistRepository from "../Repositories/checklist.repository.js";
import ReviewsRepository from "../Repositories/reviews.repository.js";
import ChecklistItemsRepository from "../Repositories/checklistItems.repository.js";
import prisma from "../lib/prisma.js";
import { Checklist } from "../types/checklist.js";

class userService {
  private checklistRepo: ChecklistRepository;
  private reviewRepo: ReviewsRepository;
  private checklistItemsRepo: ChecklistItemsRepository;

  constructor() {
    this.checklistRepo = new ChecklistRepository();
    this.reviewRepo = new ReviewsRepository();
    this.checklistItemsRepo = new ChecklistItemsRepository();
  }

  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await this.checklistRepo.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await this.checklistRepo.deleteChecklist(checklistId);
  }

  async getAllReviewsByUserId(userId: number) {
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

  async getChecklistsByUserId(userId: number) {
    const checklists = await this.checklistRepo.getChecklistsByUserId(userId);
    return checklists;
  }

  async getChecklistByReviewId(userId: number, checklistId: number) {
    const checklist = await this.checklistRepo.getChecklistByChecklistId(
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

    const items = await this.checklistItemsRepo.getChecklistItems(checklistId);
    const itemRes = items.map((item) => ({
      itemLabel: item.item.itemLabel,
      packingBag: item.packingBag,
    }));

    const res = { ...flatChecklistWithCity, items: itemRes };
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
    return checklist;
  }
}

export default new userService();
