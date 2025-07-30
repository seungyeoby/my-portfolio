import { Router } from "express";
import userController from "../Controllers/user.controller.js";
const router = Router();

// 체크리스트 생성
router.post("/checklists", userController.createChecklist);

export default router;
