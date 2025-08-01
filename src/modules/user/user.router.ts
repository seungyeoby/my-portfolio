import express from "express";
import { authenticateToken } from "../../middlewares/auth.js";
import { changePasswordValidation, validateCurrentPassword } from "../../middlewares/validation.js";
import { UserController } from "./user.controller.js";

const router = express.Router();
const userController = new UserController();

// 비밀번호 변경
router.put("/password", authenticateToken, changePasswordValidation, validateCurrentPassword, userController.changePassword);

// 회원 탈퇴
router.delete("/account", authenticateToken, userController.deleteAccount);

export default router; 