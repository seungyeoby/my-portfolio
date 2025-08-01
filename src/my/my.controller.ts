import { Request, Response } from "express";
import UserService from "./my.service.js";
import { getProfilePhotoPath } from "../middlewares/upload.js";
import { Checklist, ChangedChecklistItems } from "../types/checklist.js";
import { PackingBag } from "@prisma/client";

class UserController {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  // 개인정보 조회
  getPersonalInfo = async (req: Request, res: Response) => {
    const userId = 1;
    //const userId: number = req.user!.userId; //추후 수정
    const publicPersonalInfo = await this.userService.getPublicPersonalInfo(
      userId
    );
    return res.status(200).send({
      publicPersonalInfo,
    });
  };

  // 개인정보 수정
  updatePersonalInfo = async (req: Request, res: Response) => {
    //const userId: number = req.user!.userId;
    const userId = 1;
    const updatedInfo = {
      ...req.body,
      profilePhoto: req.file
        ? getProfilePhotoPath(req.file.filename)
        : undefined,
    };
    const updatedUser = await this.userService.updatePersonalInfo(
      userId,
      updatedInfo
    );
    return res.status(200).send({
      updatedUser,
    });
  };

  // 전체 준비물 리뷰 조회
  getAllReviews = async (req: Request, res: Response) => {
    const userId = 1;
    //const userId: number = req.user!.userId;
    const reviews = await this.userService.getAllReviews(userId);
    return res.status(200).send({
      reviews,
    });
  };

  // 개별 준비물 리뷰 조회
  getReviewByReviewId = async (req: Request, res: Response) => {
    const userId = 1;
    //const userId: number = req.user!.userId;
    const reviewId: number = Number(req.params.reviewId);
    const review = await this.userService.getReviewByReviewId(userId, reviewId);
    return res.status(200).send({
      review,
    });
  };

  // 내가 공유한 체크리스트 전체 조회
  getSharedChecklists = async (req: Request, res: Response) => {
    const userId = 1;
    //const userId: number = req.user!.userId;
    const sharedChecklists = await this.userService.getSharedChecklists(userId);
    return res.status(200).send({
      sharedChecklists,
    });
  };

  // 내가 공유한 개별 체크리스트 조회
  getSharedChecklist = async (req: Request, res: Response) => {
    const userId = 1;
    //const userId: number = req.user!.userId;
    const checklistId: number = Number(req.params.checklistId);
    const sharedChecklist = await this.userService.getSharedChecklist(
      userId,
      checklistId
    );
    return res.status(200).send({
      sharedChecklist,
    });
  };

  // 전체 체크리스트 조회
  getChecklistsByUserId = async (req: Request, res: Response) => {
    //const userId: number = req.user!.userId;
    const userId = 1;
    const checklists = await this.userService.getChecklistsByUserId(userId);
    return res.status(200).send({
      checklists,
    });
  };

  // 개별 체크리스트 조회
  getChecklistByChecklistId = async (req: Request, res: Response) => {
    //const userId: number = req.user!.userId;
    const userId = 1;
    const checklistId: number = Number(req.params.checklistId);
    const checklist = await this.userService.getChecklistByReviewId(
      userId,
      checklistId
    );
    return res.status(200).send({
      checklist,
    });
  };

  // 체크리스트 생성
  createChecklist = async (req: Request, res: Response) => {
    const checklist: Checklist = req.body;
    await this.userService.createChecklist(checklist);
    return res.status(201).send({
      message: "체크리스트 생성 완료",
    });
  };

  // 체크리스트 수정
  updateChecklist = async (req: Request, res: Response) => {
    const checklistId: number = Number(req.params.checklistId);
    const change: ChangedChecklistItems = {
      addedItems: (req.body.addedItems ?? []).map((it: any) => ({
        itemId: it.itemId,
        packingBag: it.packingBag as PackingBag,
      })),
      removedItems: req.body.removedItems ?? [],
      packingBagChangedItems: req.body.packingBagChangedItems ?? [],
    };
    await this.userService.updateChecklist(checklistId, change);
    return res.sendStatus(204);
  };

  // 체크리스트 삭제
  deleteChecklist = async (req: Request, res: Response) => {
    const checklistId: number = Number(req.params.checklistId);
    await this.userService.deleteChecklist(checklistId);
    return res.status(200).send({
      message: "체크리스트 soft-delete 완료",
      deletedId: checklistId,
    });
  };
}

export default new UserController();
