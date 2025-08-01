import { Response } from "express";
import bcrypt from "bcrypt";
import { RefreshTokenService } from "../services/refreshTokenService.js";
import { UserRepository } from "../repositories/user.Repository.js";
import { 
  AuthRequest, 
  ApiResponse, 
  ChangePasswordRequest 
} from "../types/index.js";
import { asyncHandler } from "../middlewares/errorHandler.js";

export class UserController {
  private refreshTokenService: RefreshTokenService;
  private userRepository: UserRepository;

  constructor() {
    this.refreshTokenService = new RefreshTokenService();
    this.userRepository = new UserRepository();
  }

  // 비밀번호 변경
  changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { newPassword }: ChangePasswordRequest = req.body;

    if (!userId) {
      throw new Error("사용자 ID가 없습니다");
    }

    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.userRepository.updatePassword(userId, hashedNewPassword);

    // 보안 강화: 비밀번호 변경 시 모든 RefreshToken 무효화
    await this.refreshTokenService.revokeAllUserTokens(userId);

    const response: ApiResponse = {
      success: true,
      message: "비밀번호가 변경되었습니다. 모든 기기에서 다시 로그인해주세요.",
    };

    res.json(response);
  });

  // 회원 탈퇴
  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new Error("사용자 ID가 없습니다");
    }

    // 사용자 삭제 (CASCADE로 인해 관련 데이터도 함께 삭제됨)
    await this.userRepository.delete(userId);

    const response: ApiResponse = {
      success: true,
      message: "회원 탈퇴가 완료되었습니다",
    };

    res.json(response);
  });
} 