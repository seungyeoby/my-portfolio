import { Router } from "express";
import upload from "../middlewares/upload.js";
import userController from "./my.controller.js";
import { authenticateToken } from "../middlewares/authenticate.js";
import {
  checklistValidator,
  reviewValidator,
  handleValidationResult,
} from "../middlewares/validation.js";

const router: Router = Router();

// 개인정보 조회
router.get("/", authenticateToken, userController.getPersonalInfo);

// 개인정보 수정
router.patch(
  "/",
  authenticateToken,
  upload.single("profilePhoto"),
  userController.updatePersonalInfo
);

// 전체 준비물 리뷰 조회
router.get("/items-reviews", authenticateToken, userController.getAllReviews);

// 개별 준비물 리뷰 조회
router.get(
  "/items-reviews/:reviewId",
  authenticateToken,
  reviewValidator,
  handleValidationResult,
  userController.getReviewByReviewId
);

// 내가 공유한 체크리스트 전체 조회
router.get(
  "/shared-checklists",
  authenticateToken,
  userController.getSharedChecklists
);

// 내가 공유한 개별 체크리스트 조회
router.get(
  "/shared-checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  userController.getSharedChecklist
);

// 전체 체크리스트 조회
router.get(
  "/checklists",
  authenticateToken,
  userController.getChecklistsByUserId
);

// 개별 체크리스트 조회
router.get(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  userController.getChecklistByChecklistId
);

// 체크리스트 생성
router.post("/checklists", authenticateToken, userController.createChecklist);

// 체크리스트 수정
router.patch(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  userController.updateChecklist
);

// 체크리스트 삭제
router.delete(
  "/checklists/:checklistId",
  authenticateToken,
  checklistValidator,
  handleValidationResult,
  userController.deleteChecklist
);

export default router;
