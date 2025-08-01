import express from "express";
import { uploadProfilePhoto } from "../middlewares/upload.js";
import { AuthController } from "../controllers/authController.js";
import { 
  signupValidation, 
  signinValidation, 
  findIdValidation, 
  resetPasswordValidation,
  validateEmailNotExists,
  validateNicknameNotExists
} from "../middlewares/validation.js";

const router = express.Router();

// 회원가입 API (파일 업로드 포함)
router.post("/sign-up", uploadProfilePhoto, signupValidation, validateEmailNotExists, validateNicknameNotExists, AuthController.signup);

// 로그인 API
router.post("/sign-in", signinValidation, AuthController.signin);

// 로그아웃 API
router.post("/sign-out", AuthController.signout);

// 이메일 찾기 API
router.post("/find-id", findIdValidation, AuthController.findId);

// 비밀번호 재설정 API
router.post("/reset-password", resetPasswordValidation, AuthController.resetPassword);

// Access Token 갱신 API (보안 강화)
router.post("/refresh", AuthController.refresh);

export default router; 