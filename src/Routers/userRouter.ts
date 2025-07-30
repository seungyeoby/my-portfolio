import { Router } from "express";
import userController from "../Controllers/user.controller.js";
const router = Router();

// 개인정보 조회

// 개인정보 수정

// 전체 준비물 리뷰 조회
router.get("/items-reviews", userController.getAllReviews);

// 개별 준비물 리뷰 조회
router.get("/items-reviews/:reviewId", userController.getReviewByReviewId);

// 내가 공유한 체크리스트 전체 조회
router.get("/shared-checklists", userController.getSharedChecklists);

// 내가 공유한 개별 체크리스트 조회
router.get(
  "/shared-checklists/:checklistId",
  userController.getSharedChecklist
);

// 전체 체크리스트 조회
router.get("/checklists", userController.getChecklistsByUserId);

// 개별 체크리스트 조회
router.get(
  "/checklists/:checklistId",
  userController.getChecklistByChecklistId
);

// 체크리스트 생성
router.post("/checklists", userController.createChecklist);

// 체크리스트 수정

// 체크리스트 삭제
router.delete("/checklists/:checklistId", userController.deleteChecklist);
export default router;
