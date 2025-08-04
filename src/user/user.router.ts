import express, { Request, Response } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { changePasswordValidation, validateCurrentPassword } from "../middlewares/validation.js";

const router = express.Router();

// 비밀번호 변경
router.put("/password", authenticateToken, changePasswordValidation, validateCurrentPassword, (req: Request, res: Response) => {
  res.status(501).json({ message: "비밀번호 변경 기능은 구현 예정입니다" });
});

// 회원 탈퇴
router.delete("/account", authenticateToken, (req: Request, res: Response) => {
  res.status(501).json({ message: "회원 탈퇴 기능은 구현 예정입니다" });
});

export default router; 