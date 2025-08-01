import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { RefreshTokenService } from "../services/refreshTokenService.js";
import { 
  AuthRequest, 
  ApiResponse, 
  ChangePasswordRequest 
} from "../types/index.js";

export class UserController {
  // 비밀번호 변경
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { newPassword }: ChangePasswordRequest = req.body;

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

      const response: ApiResponse = {
        success: true,
        message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
      };

      res.json(response);
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      const response: ApiResponse = {
        success: false,
        message: "서버 오류가 발생했습니다",
      };
      res.status(500).json(response);
    }
  }

  // 회원 탈퇴
  static async deleteAccount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      // 사용자 삭제 (CASCADE로 인해 관련 데이터도 함께 삭제됨)
      await prisma.user.delete({
        where: { userId },
      });

      const response: ApiResponse = {
        success: true,
        message: "회원 탈퇴가 완료되었습니다",
      };

      res.json(response);
    } catch (error) {
      console.error("회원 탈퇴 오류:", error);
      const response: ApiResponse = {
        success: false,
        message: "서버 오류가 발생했습니다",
      };
      res.status(500).json(response);
    }
  }
} 