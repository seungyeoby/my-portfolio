import { Router } from "express";
import { uploadProfilePhoto } from "../../middlewares/upload.js";
import userController from "./my.controller.js";
import { authenticateToken } from "../../middlewares/auth.js";
import {
  checklistValidator,
  reviewValidator,
  handleValidationResult,
} from "../../middlewares/validation.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";

const router: Router = Router();

// 개인정보 조회
router.get(
  "/",
  authenticateToken,
  asyncHandler(userController.getPersonalInfo)
);

// 개인정보 수정
router.patch(
  "/",
  authenticateToken,
  uploadProfilePhoto,
  asyncHandler(userController.updatePersonalInfo)
);

// 전체 준비물 리뷰 조회
router.get(
  "/items-reviews",
  authenticateToken,
  asyncHandler(userController.getAllReviews)
);

// 개별 준비물 리뷰 조회
router.get(
  "/items-reviews/:reviewId",
  authenticateToken,
  reviewValidator,
  handleValidationResult,
  asyncHandler(userController.getReviewByReviewId)
);

// 내가 공유한 체크리스트 전체 조회
router.get(
  "/shared-checklists",
  authenticateToken,
  asyncHandler(userController.getSharedChecklists)
);

// 내가 공유한 개별 체크리스트 조회
router.get(
  "/shared-checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  asyncHandler(userController.getSharedChecklist)
);

// 전체 체크리스트 조회
router.get(
  "/checklists",
  authenticateToken,
  asyncHandler(userController.getChecklistsByUserId)
);

// 개별 체크리스트 조회
router.get(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  asyncHandler(userController.getChecklistByChecklistId)
);

// 체크리스트 생성
router.post(
  "/checklists",
  authenticateToken,
  asyncHandler(userController.createChecklist)
);

// 체크리스트 수정
router.patch(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  asyncHandler(userController.updateChecklist)
);

// 체크리스트 삭제
router.delete(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  asyncHandler(userController.deleteChecklist)
);

export default router;
