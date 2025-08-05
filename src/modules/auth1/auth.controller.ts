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
}

export default new AuthController();
