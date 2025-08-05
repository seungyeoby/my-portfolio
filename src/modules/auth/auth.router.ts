import { Router } from "express";
import { uploadProfilePhoto } from "../../middlewares/upload.js";
import {
  signupValidation,
  signinValidation,
  findIdValidation,
  resetPasswordValidation,
  handleValidationResult,
} from "../../middlewares/validation.js";
import authController from "./auth.controller.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router: Router = Router();

router.post(
  "/sign-up",
  signupValidation,
  handleValidationResult,
  uploadProfilePhoto,
  asyncHandler(authController.signUp)
);

router.post(
  "/sign-in",
  signinValidation,
  handleValidationResult,
  asyncHandler(authController.signIn)
);

// 로그아웃
router.post("/sign-out", asyncHandler(authController.signOut));

// 본인 확인
router.get("/me", authenticateToken, asyncHandler(authController.isLogged));

// // 이메일 찾기
// router.post(
//   "/find-id",
//   findIdValidation,
//   handleValidationResult,
//   asyncHandler(authController.findId)
// );

// // 비밀번호 재설정
// router.post(
//   "/reset-password",
//   resetPasswordValidation,
//   handleValidationResult,
//   asyncHandler(authController.resetPassword)
// );

export default router;
