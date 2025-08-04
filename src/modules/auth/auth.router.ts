import express, { Request, Response } from "express";
import { uploadProfilePhoto } from "../../middlewares/upload.js";
import { 
  signupValidation, 
  signinValidation, 
  findIdValidation, 
  resetPasswordValidation,
  validateEmailNotExists,
  validateNicknameNotExists
} from "../../middlewares/validation.js";

const router = express.Router();

// 회원가입 API (파일 업로드 포함)
router.post("/sign-up", uploadProfilePhoto, signupValidation, validateEmailNotExists, validateNicknameNotExists, (req: Request, res: Response) => {
  res.status(501).json({ message: "회원가입 기능은 구현 예정입니다" });
});

// 로그인 API
router.post("/sign-in", signinValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "로그인 기능은 구현 예정입니다" });
});

// 로그아웃 API
router.post("/sign-out", (req: Request, res: Response) => {
  res.status(501).json({ message: "로그아웃 기능은 구현 예정입니다" });
});

// 이메일 찾기 API
router.post("/find-id", findIdValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "이메일 찾기 기능은 구현 예정입니다" });
});

// 비밀번호 재설정 API
router.post("/reset-password", resetPasswordValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "비밀번호 재설정 기능은 구현 예정입니다" });
});

// Access Token 갱신 API (보안 강화)
router.post("/refresh", (req: Request, res: Response) => {
  res.status(501).json({ message: "토큰 갱신 기능은 구현 예정입니다" });
});

export default router; 