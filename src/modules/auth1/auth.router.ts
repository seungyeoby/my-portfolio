import { Router } from "express";
import { uploadProfilePhoto } from "../../middlewares/upload.js";
import {
  signupValidation,
  signinValidation,
  findIdValidation,
  resetPasswordValidation,
  // validateEmailNotExists,
  // validateNicknameNotExists,
  handleValidationResult,
} from "../../middlewares/validation.js";
import authController from "./auth.controller.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";

const router: Router = Router();

router.post(
  "/sign-up",
  signupValidation,
  handleValidationResult,
  asyncHandler(authController.signUp)
);

router.post(
  "/sign-in",
  signinValidation,
  handleValidationResult,
  asyncHandler(authController.signIn)
);

export default router;
