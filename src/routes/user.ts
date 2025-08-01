import express from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { updateUserValidation, changePasswordValidation, validateNicknameNotExistsForUpdate, validateCurrentPassword } from "../middlewares/validation.js";
import { UserController } from "../controllers/userController.js";

const router = express.Router();

// 내 정보 조회
router.get("/profile", authenticateToken, UserController.getProfile);

// 내 정보 수정
router.put("/profile", authenticateToken, updateUserValidation, validateNicknameNotExistsForUpdate, UserController.updateProfile);

// 비밀번호 변경
router.put("/password", authenticateToken, changePasswordValidation, validateCurrentPassword, UserController.changePassword);

// 회원 탈퇴
router.delete("/account", authenticateToken, UserController.deleteAccount);

export default router; 