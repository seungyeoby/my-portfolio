import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { authenticateToken } from "../middleware/auth.js";
import { updateUserValidation, changePasswordValidation } from "../utils/validation.js";

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
router.put("/profile", authenticateToken, updateUserValidation, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: errors.array(),
      });
    }

    const userId = req.user?.userId;
    const { nickname, birthDate, gender, profilePhoto } = req.body;

    // 닉네임 중복 확인 (변경하려는 경우)
    if (nickname) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nickname,
          userId: { not: userId },
        },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "이미 사용 중인 닉네임입니다",
        });
      }
    }

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
router.put("/password", authenticateToken, changePasswordValidation, async (req: AuthRequest, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: errors.array(),
      });
    }

    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    // 현재 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "현재 비밀번호가 올바르지 않습니다",
      });
    }

    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await prisma.user.update({
      where: { userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      success: true,
      message: "비밀번호가 변경되었습니다",
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