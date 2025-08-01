import { Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import { RefreshTokenService } from "../services/refreshTokenService.js";
import { 
  AuthRequest, 
  ApiResponse, 
  User, 
  UpdateUserRequest, 
  ChangePasswordRequest 
} from "../types/index.js";

export class UserController {
  // 내 정보 조회
  static async getProfile(req: AuthRequest, res: Response): Promise<void> {
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
        const response: ApiResponse = {
          success: false,
          message: "사용자를 찾을 수 없습니다",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<User> = {
        success: true,
        message: "프로필 조회 성공",
        data: {
          userId: Number(user.userId),
          nickname: user.nickname,
          email: user.email,
          birthDate: user.birthDate,
          gender: user.gender || undefined,
          profilePhoto: user.profilePhoto || undefined,
          authority: user.authority,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("프로필 조회 오류:", error);
      const response: ApiResponse = {
        success: false,
        message: "서버 오류가 발생했습니다",
      };
      res.status(500).json(response);
    }
  }

  // 내 정보 수정
  static async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { nickname, birthDate, gender, profilePhoto }: UpdateUserRequest = req.body;

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

      const response: ApiResponse<User> = {
        success: true,
        message: "프로필이 업데이트되었습니다",
        data: {
          userId: Number(updatedUser.userId),
          nickname: updatedUser.nickname,
          email: updatedUser.email,
          birthDate: updatedUser.birthDate,
          gender: updatedUser.gender || undefined,
          profilePhoto: updatedUser.profilePhoto || undefined,
          authority: updatedUser.authority,
        },
      };

      res.json(response);
    } catch (error) {
      console.error("프로필 업데이트 오류:", error);
      const response: ApiResponse = {
        success: false,
        message: "서버 오류가 발생했습니다",
      };
      res.status(500).json(response);
    }
  }

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