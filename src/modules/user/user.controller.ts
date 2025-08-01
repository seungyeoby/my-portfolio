import { Response } from "express";
import { UserService } from "./user.service.js";
import { 
  AuthRequest, 
  ApiResponse, 
  ChangePasswordRequest 
} from "../../types/index.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // 비밀번호 변경
  changePassword = asyncHandler(async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { newPassword }: ChangePasswordRequest = req.body;

    if (!userId) {
      throw new Error("사용자 ID가 없습니다");
    }

    await this.userService.changePassword(userId, newPassword);

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

    await this.userService.deleteAccount(userId);

    const response: ApiResponse = {
      success: true,
      message: "회원 탈퇴가 완료되었습니다",
    };

    res.json(response);
  });
} 