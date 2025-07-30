import { Request, Response } from "express";
import userService from "../Services/user.service.js";
import { Checklist } from "../types/checklist.js";

class UserController {
  async getChecklistsByUserId(req: Request, res: Response) {
    const userId = 1; // 추후 수정
    const checklists = await userService.getChecklistsByUserId(userId);
    return res.status(200).send({
      checklists,
    });
  }

  async getChecklistByChecklistId(req: Request, res: Response) {
    const userId: number = 1; // 추후수정
    const checklistId: number = Number(req.params.checklistId);
    const checklist = await userService.getChecklistByReviewId(
      userId,
      checklistId
    );
    return res.status(200).send({
      checklist,
    });
  }

  async createChecklist(req: Request, res: Response) {
    const checklist: Checklist = req.body;
    await userService.createChecklist(checklist);
    return res.status(201).send({
      message: "체크리스트 생성 완료",
    });
  }

  async deleteChecklist(req: Request, res: Response) {
    const checklistId: number = Number(req.params.checklistId);
    await userService.deleteChecklist(checklistId);
    return res.status(200).send({
      message: "체크리스트 soft-delete 완료",
      deletedId: checklistId,
    });
  }

  async getAllReviews(req: Request, res: Response) {
    const userId = 1; // 추후 수정
    const reviews = await userService.getAllReviewsByUserId(userId);
    return res.status(200).send({
      reviews,
    });
  }

  async getReviewByReviewId(req: Request, res: Response) {
    const userId: number = 1; // 추후 수정
    const reviewId: number = Number(req.params.reviewId);
    const review = await userService.getReviewByReviewId(userId, reviewId);
    return res.status(200).send({
      review,
    });
  }
}

export default new UserController();
