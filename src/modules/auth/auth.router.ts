// import express from "express";
// import { uploadProfilePhoto } from "../../middlewares/upload.js";
// import {
//   signupValidation,
//   signinValidation,
//   findIdValidation,
//   resetPasswordValidation,
//   validateEmailNotExists,
//   validateNicknameNotExists
// } from "../../middlewares/validation.js";
// import { AuthController } from "./auth.controller.js";

// const router = express.Router();
// const authController = new AuthController();

// // 회원가입 API (파일 업로드 포함)
// router.post("/sign-up", uploadProfilePhoto, signupValidation, validateEmailNotExists, validateNicknameNotExists, authController.signup);

// // 로그인 API
// router.post("/sign-in", signinValidation, authController.signin);

// // 로그아웃 API
// router.post("/sign-out", authController.signout);

// // 이메일 찾기 API
// router.post("/find-id", findIdValidation, authController.findId);

// // 비밀번호 재설정 API
// router.post("/reset-password", resetPasswordValidation, authController.resetPassword);

// // Access Token 갱신 API (보안 강화)
// router.post("/refresh", authController.refresh);

// export default router;
