import { Router } from "express";
import userController from "../Controllers/user.controller.js";
const router = Router();

// 체크리스트 생성
router.post("/checklists", userController.createChecklist);

// 체크리스트 수정

// 체크리스트 삭제
router.delete("/checklists/:checklistId", userController.deleteChecklist);
export default router;
