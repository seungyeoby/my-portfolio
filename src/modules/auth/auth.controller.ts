import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";
import { 
  ApiResponse, 
  User
} from "../../types/index.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  // 회원가입
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("회원가입 요청 받음:", req.body);
    console.log("업로드된 파일:", req.file);
    
    const { nickname, email, password, birthDate, gender } = req.body;
    console.log("파싱된 데이터:", { nickname, email, birthDate, gender });

    const newUser = await this.authService.signup(
      { nickname, email, password, birth: birthDate, gender },
      req.file
    );

    console.log("사용자 생성 완료:", newUser.email);

    const response: ApiResponse<User> = {
      success: true,
      message: "회원가입이 완료되었습니다",
      data: newUser,
    };

    res.status(201).json(response);
  });

  // 로그인
  signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("로그인 요청 받음:", req.body);
    
    const { email, password } = req.body;
    console.log("파싱된 데이터:", { email });

    const result = await this.authService.signin({ email, password });

    // Refresh Token을 HttpOnly 쿠키로 설정
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    console.log("로그인 성공:", result.user.email);

    const response: ApiResponse<{ accessToken: string; user: User }> = {
      success: true,
      message: "로그인이 완료되었습니다",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };

    res.json(response);
  });

  // 로그아웃
  signout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("로그아웃 요청 받음");
    
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await this.authService.signout(refreshToken);
    }

    // 쿠키 삭제
    res.clearCookie("refreshToken");

    console.log("로그아웃 완료");

    const response: ApiResponse = {
      success: true,
      message: "로그아웃이 완료되었습니다",
    };

    res.json(response);
  });

  // 이메일 찾기
  findId = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("이메일 찾기 요청 받음:", req.body);
    
    const { nickname, birth } = req.body;
    console.log("파싱된 데이터:", { nickname, birth });

    const email = await this.authService.findId(nickname, birth);

    console.log("이메일 찾기 성공:", email);

    const response: ApiResponse<{ email: string }> = {
      success: true,
      message: "이메일을 찾았습니다",
      data: { email },
    };

    res.json(response);
  });

  // 비밀번호 재설정
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("비밀번호 재설정 요청 받음:", req.body);
    
    const { email, nickname, birth, newPassword } = req.body;
    console.log("파싱된 데이터:", { email, nickname, birth });

    await this.authService.resetPassword(email, nickname, birth, newPassword);

    console.log("비밀번호 재설정 성공:", email);

    const response: ApiResponse = {
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다",
    };

    res.json(response);
  });

  // Access Token 갱신
  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("Access Token 갱신 요청 받음");
    
    // 쿠키에서 Refresh Token 추출
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      throw new Error("Refresh Token이 필요합니다");
    }

    const result = await this.authService.refresh(refreshToken);

    // 새로운 Refresh Token을 쿠키에 설정
    res.cookie("refreshToken", result.newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    console.log("Access Token 갱신 성공");

    const response: ApiResponse<{ accessToken: string }> = {
      success: true,
      message: "Access Token이 갱신되었습니다",
      data: { accessToken: result.accessToken },
    };

    res.json(response);
  });
} 