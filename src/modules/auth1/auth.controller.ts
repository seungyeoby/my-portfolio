import AuthService from "./auth.service.js";
import { Request, Response } from "express";
import { SignUpInfo, SignInInfo } from "../../types/user.js";

class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
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
    return res.status(200).json({ publicUserInfo, token });
  };

  // 로그아웃
  signOut = async (req: Request, res: Response) => {
    const result = await this.authService.signOut();
    return res.status(200).json({
      message: result.message,
    });
  };

  // 이메일 찾기
  findId = async (req: Request, res: Response) => {
    const { nickname, birthDate } = req.body;
    const email = await this.authService.findId(nickname, birthDate);
    return res.status(200).json({
      message: "이메일을 찾았습니다",
      email,
    });
  };

  // 비밀번호 재설정
  resetPassword = async (req: Request, res: Response) => {
    const { email, nickname, birthDate, newPassword } = req.body;
    await this.authService.resetPassword(email, nickname, birthDate, newPassword);
    return res.status(200).json({
      message: "비밀번호가 성공적으로 재설정되었습니다",
    });
  };
}

export default new AuthController();
