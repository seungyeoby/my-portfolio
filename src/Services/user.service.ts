import checklistRepository from "../Repositories/checklist.repository.js";
import reviewsRepository from "../Repositories/reviews.repository.js";
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
}

export default new userService();
