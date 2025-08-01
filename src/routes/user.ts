import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { updateUserValidation, changePasswordValidation, validateNicknameNotExistsForUpdate, validateCurrentPassword } from "../middleware/validation.js";
import { RefreshTokenService } from "../services/refreshTokenService.js";

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    authority: string;
  };
}

// 내 정보 조회
router.get("/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        userId: true,
        nickname: true,
        email: true,
        birthDate: true,
        gender: true,
        profilePhoto: true,
        authority: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("프로필 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 내 정보 수정
router.put("/profile", authenticateToken, updateUserValidation, validateNicknameNotExistsForUpdate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { nickname, birthDate, gender, profilePhoto } = req.body;

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: {
        ...(nickname && { nickname }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        ...(gender && { gender }),
        ...(profilePhoto !== undefined && { profilePhoto }),
      },
      select: {
        userId: true,
        nickname: true,
        email: true,
        birthDate: true,
        gender: true,
        profilePhoto: true,
        authority: true,
      },
    });

    res.json({
      success: true,
      message: "프로필이 업데이트되었습니다",
      data: updatedUser,
    });
  } catch (error) {
    console.error("프로필 업데이트 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 비밀번호 변경
router.put("/password", authenticateToken, changePasswordValidation, validateCurrentPassword, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { newPassword } = req.body;

    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });

    // 보안 강화: 비밀번호 변경 시 모든 RefreshToken 무효화
    if (userId) {
      await RefreshTokenService.revokeAllUserTokens(userId);
    }

    res.json({
      success: true,
      message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
    });
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 회원 탈퇴
router.delete("/account", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    // 사용자 삭제 (CASCADE로 인해 관련 데이터도 함께 삭제됨)
    await prisma.user.delete({
      where: { userId },
    });

    res.json({
      success: true,
      message: "회원 탈퇴가 완료되었습니다",
    });
  } catch (error) {
    console.error("회원 탈퇴 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router; 