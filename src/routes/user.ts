import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { changePasswordValidation, validateCurrentPassword } from "../middlewares/validation.js";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

// 비밀번호 변경
router.put("/password", authenticateToken, changePasswordValidation, validateCurrentPassword, UserController.changePassword);

// 회원 탈퇴
router.delete("/account", authenticateToken, UserController.deleteAccount);

export default router;