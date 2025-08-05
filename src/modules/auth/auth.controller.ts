import AuthService from "./auth.service.js";
import UserRepository from "../../repositories/user.repository.js";
import { Request, Response } from "express";
import { SignUpInfo, SignInInfo } from "../../types/user.js";
import {
  FindEmailRequest,
  FindEmailResponse,
  ResetPasswordRequest,
  LogoutResponse,
} from "../../types/index.js";

class AuthController {
  private authService: AuthService;
  private userRepo: UserRepository;

  constructor() {
    this.authService = new AuthService();
    this.userRepo = new UserRepository();
  }

  signUp = async (req: Request, res: Response) => {
    const userInfo: SignUpInfo = req.body;
    await this.authService.signUp(userInfo);
    return res.status(201).json({
      message: "회원가입 완료",
    });
  };

  signIn = async (req: Request, res: Response) => {
    const userInfo: SignInInfo = req.body;
    const { publicUserInfo, token } = await this.authService.signIn(userInfo);
    return res.status(200).json({
      data: { publicUserInfo, token },
    });
  };

  // 로그아웃
  signOut = async (req: Request, res: Response): Promise<void> => {
    // 실제 구현에서는 토큰 블랙리스트나 세션 관리가 필요할 수 있음
    const response: LogoutResponse = {
      message: "로그아웃이 완료되었습니다",
    };
    res.status(200).json(response);
  };

  // 이메일 찾기
  findId = async (req: Request, res: Response): Promise<void> => {
    const { nickname, birthDate }: FindEmailRequest = req.body;

    // UserRepository를 직접 사용
    const user = await this.userRepo.findByNicknameAndBirth(
      nickname,
      new Date(birthDate)
    );

    if (!user) {
      throw new Error("UserInfoNotFound");
    }

    const response: FindEmailResponse = {
      message: "이메일을 찾았습니다",
      email: user.email,
    };
    res.status(200).json(response);
  };

  // 비밀번호 재설정
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const { email, nickname, birthDate, newPassword }: ResetPasswordRequest =
      req.body;

    // UserRepository를 직접 사용
    const user = await this.userRepo.findByEmailNicknameAndBirth(
      email,
      nickname,
      new Date(birthDate)
    );

    if (!user) {
      throw new Error("UserInfoNotFound");
    }

    // 새 비밀번호 해시화
    const bcrypt = await import("bcrypt");
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 비밀번호 업데이트
    await this.userRepo.updatePassword(Number(user.userId), hashedPassword);

    res.status(200).json({
      message: "비밀번호가 성공적으로 재설정되었습니다",
    });
  };
}

export default new AuthController();
