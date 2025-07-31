import { Request, Response } from "express";
import userService from "../Services/user.service.js";
import { Checklist } from "../types/checklist.js";
import { Change } from "../types/change.js";
import { PackingBag } from "@prisma/client";

class UserController {
  // 개인정보 조회
  async getPersonalInfo(req: Request, res: Response) {
    const userId: number = 1; //추후 수정
    const publicPersonalInfo = await userService.getPublicPersonalInfo(userId);
    return res.status(200).send({
      publicPersonalInfo,
    });
  }

  // 개인정보 수정
  async updatePersonalInfo() {}

  // 전체 준비물 리뷰 조회
  async getAllReviews(req: Request, res: Response) {
    const userId: number = 1; // 추후 수정
    const reviews = await userService.getAllReviews(userId);
    return res.status(200).send({
      reviews,
    });
  }

  // 개별 준비물 리뷰 조회
  async getReviewByReviewId(req: Request, res: Response) {
    const userId: number = 1; // 추후 수정
    const reviewId: number = Number(req.params.reviewId);
    const review = await userService.getReviewByReviewId(userId, reviewId);
    return res.status(200).send({
      review,
    });
  }

  // 내가 공유한 체크리스트 전체 조회
  async getSharedChecklists(req: Request, res: Response) {
    const userId: number = 1; // 추후수정
    const sharedChecklists = await userService.getSharedChecklists(userId);
    return res.status(200).send({
      sharedChecklists,
    });
  }

  // 내가 공유한 개별 체크리스트 조회
  async getSharedChecklist(req: Request, res: Response) {
    const userId: number = 1; // 추후수정
    const checklistId: number = Number(req.params.checklistId);
    const sharedChecklist = await userService.getSharedChecklist(
      userId,
      checklistId
    );
    return res.status(200).send({
      sharedChecklist,
    });
  }

  // 전체 체크리스트 조회
  async getChecklistsByUserId(req: Request, res: Response) {
    const userId: number = 1; // 추후 수정
    const checklists = await userService.getChecklistsByUserId(userId);
    return res.status(200).send({
      checklists,
    });
  }

  // 개별 체크리스트 조회
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

  // 체크리스트 생성
  async createChecklist(req: Request, res: Response) {
    const checklist: Checklist = req.body;
    await userService.createChecklist(checklist);
    return res.status(201).send({
      message: "체크리스트 생성 완료",
    });
  }

  // 체크리스트 수정
  async updateChecklist(req: Request, res: Response) {
    const checklistId: number = Number(req.params.checklistId);
    const change: Change = {
      addedItems: (req.body.added_items ?? []).map((it: any) => ({
        itemId: it.item_id,
        packingBag: it.packing_bag as PackingBag,
      })),
      removedItems: req.body.removed_items ?? [],
      packingBagChangedItems: req.body.packing_bag_changed_items ?? [],
    };
    await userService.updateChecklist(checklistId, change);
    return res.status(204);
  }

  // 체크리스트 삭제
  async deleteChecklist(req: Request, res: Response) {
    const checklistId: number = Number(req.params.checklistId);
    await userService.deleteChecklist(checklistId);
    return res.status(200).send({
      message: "체크리스트 soft-delete 완료",
      deletedId: checklistId,
    });
  }
}

export default new UserController();
