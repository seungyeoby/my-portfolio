import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { 
  AuthRequest, 
  ApiResponse, 
  ChangePasswordRequest 
} from "../../types/index.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";
import { Checklist, ChangedChecklistItems } from "../../types/checklist.js";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // 개인정보 조회
  getPersonalInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; //추후 수정
    const publicPersonalInfo = await this.userService.getPublicPersonalInfo(userId);
    res.status(200).send({
      publicPersonalInfo,
    });
  });

  // 개인정보 수정
  updatePersonalInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후 수정
    const updatedInfo = req.body;
    const updatedUser = await this.userService.updatePersonalInfo(
      userId,
      updatedInfo
    );
    res.status(200).send({
      updatedUser,
    });
  });

  // 전체 준비물 리뷰 조회
  getAllReviews = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후 수정
    const reviews = await this.userService.getAllReviews(userId);
    res.status(200).send({
      reviews,
    });
  });

  // 개별 준비물 리뷰 조회
  getReviewByReviewId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후 수정
    const reviewId: number = Number(req.params.reviewId);
    const review = await this.userService.getReviewByReviewId(userId, reviewId);
    res.status(200).send({
      review,
    });
  });

  // 내가 공유한 체크리스트 전체 조회
  getSharedChecklists = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후수정
    const sharedChecklists = await this.userService.getSharedChecklists(userId);
    res.status(200).send({
      sharedChecklists,
    });
  });

  // 내가 공유한 개별 체크리스트 조회
  getSharedChecklist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후수정
    const checklistId: number = Number(req.params.checklistId);
    const sharedChecklist = await this.userService.getSharedChecklist(
      userId,
      checklistId
    );
    res.status(200).send({
      sharedChecklist,
    });
  });

  // 전체 체크리스트 조회
  getChecklistsByUserId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후 수정
    const checklists = await this.userService.getChecklistsByUserId(userId);
    res.status(200).send({
      checklists,
    });
  });

  // 개별 체크리스트 조회
  getChecklistByChecklistId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId: number = 1; // 추후수정
    const checklistId: number = Number(req.params.checklistId);
    const checklist = await this.userService.getChecklistByReviewId(
      userId,
      checklistId
    );
    res.status(200).send({
      checklist,
    });
  });

  // 체크리스트 생성
  createChecklist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const checklist: Checklist = req.body;
    await this.userService.createChecklist(checklist);
    res.status(201).send({
      message: "체크리스트 생성 완료",
    });
  });

  // 체크리스트 수정
  updateChecklist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const checklistId: number = Number(req.params.checklistId);
    const change: ChangedChecklistItems = {
      addedItems: (req.body.added_items ?? []).map((it: any) => ({
        itemId: it.item_id,
        packingBag: it.packing_bag,
      })),
      removedItems: req.body.removed_items ?? [],
      packingBagChangedItems: req.body.packing_bag_changed_items ?? [],
    };
    await this.userService.updateChecklist(checklistId, change);
    res.status(204).send();
  });

  // 체크리스트 삭제
  deleteChecklist = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const checklistId: number = Number(req.params.checklistId);
    await this.userService.deleteChecklist(checklistId);
    res.status(200).send({
      message: "체크리스트 soft-delete 완료",
      deletedId: checklistId,
    });
  });

  // 비밀번호 변경
  changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { newPassword }: ChangePasswordRequest = req.body;

    if (!userId) {
      throw new Error("사용자 ID가 없습니다");
    }

    await this.userService.changePassword(userId, newPassword);

    const response: ApiResponse = {
      success: true,
      message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
    };

    res.json(response);
  });

  // 회원 탈퇴
  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error("사용자 ID가 없습니다");
    }

    await this.userService.deleteAccount(userId);

    const response: ApiResponse = {
      success: true,
      message: "회원 탈퇴가 완료되었습니다",
    };

    res.json(response);
  });
} 