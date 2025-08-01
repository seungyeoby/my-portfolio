import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RefreshTokenService } from "../services/refreshTokenService.js";
import { UserRepository } from "../repositories/userRepository.js";
import { uploadProfilePhoto, getProfilePhotoPath, getDefaultProfilePhoto } from "../middlewares/upload.js";
import { 
  AuthRequest, 
  ApiResponse, 
  User, 
  LoginRequest, 
  SignupRequest,
  JWTPayload 
} from "../types/index.js";
import { 
  asyncHandler, 
  createError, 
  createAuthError, 
  createNotFoundError,
  createConflictError 
} from "../middlewares/errorHandler.js";

export class AuthController {
  private refreshTokenService: RefreshTokenService;
  private userRepository: UserRepository;

  constructor() {
    this.refreshTokenService = new RefreshTokenService();
    this.userRepository = new UserRepository();
  }

  // 회원가입
  signup = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("회원가입 요청 받음:", req.body);
    console.log("업로드된 파일:", req.file);
    
    const { nickname, email, password, birth, gender }: SignupRequest = req.body;
    console.log("파싱된 데이터:", { nickname, email, birth, gender });

    // 프로필 사진 경로 설정
    let profilePhotoPath: string;
    if (req.file) {
      const uploadedPath = getProfilePhotoPath(req.file.filename);
      profilePhotoPath = uploadedPath || getDefaultProfilePhoto();
      console.log("업로드된 프로필 사진 경로:", profilePhotoPath);
    } else {
      profilePhotoPath = getDefaultProfilePhoto();
      console.log("기본 프로필 사진 경로:", profilePhotoPath);
    }

    // 비밀번호 해시화
    console.log("비밀번호 해시화 시작");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("비밀번호 해시화 완료");

    // 사용자 생성
    console.log("사용자 생성 시작");
    const newUser = await this.userRepository.create({
      nickname,
      email,
      password: hashedPassword,
      birthDate: new Date(birth),
      gender,
      profilePhoto: profilePhotoPath,
    });

    console.log("사용자 생성 완료:", newUser.email);

    const response: ApiResponse<User> = {
      success: true,
      message: "회원가입이 완료되었습니다",
      data: {
        userId: Number(newUser.userId),
        nickname: newUser.nickname,
        email: newUser.email,
        birthDate: newUser.birthDate,
        gender: newUser.gender || undefined,
        profilePhoto: newUser.profilePhoto || undefined,
        authority: newUser.authority,
      },
    };

    res.status(201).json(response);
  });

  // 로그인
  signin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("로그인 요청 받음:", req.body);
    
    const { email, password }: LoginRequest = req.body;
    console.log("파싱된 데이터:", { email });

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await this.userRepository.findByEmail(email);
    console.log("사용자 찾기 완료");

    if (!user) {
      throw createAuthError("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // 비밀번호 확인
    console.log("비밀번호 확인 시작");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("비밀번호 확인 완료");

    if (!isPasswordValid) {
      throw createAuthError("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // JWT 토큰 생성
    console.log("JWT 토큰 생성 시작");
    const accessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      } as JWTPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // 보안 강화된 RefreshToken 생성
    const refreshToken = await this.refreshTokenService.createRefreshToken(Number(user.userId));
    console.log("보안 RefreshToken 생성 완료");

    // Refresh Token을 HttpOnly 쿠키로 설정
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    console.log("로그인 성공:", user.email);

    const response: ApiResponse<{ accessToken: string; user: User }> = {
      success: true,
      message: "로그인이 완료되었습니다",
      data: {
        accessToken,
        user: {
          userId: Number(user.userId),
          nickname: user.nickname,
          email: user.email,
          birthDate: user.birthDate,
          gender: user.gender || undefined,
          profilePhoto: user.profilePhoto || undefined,
          authority: user.authority,
        },
      },
    };

    res.json(response);
  });

  // 로그아웃
  signout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("로그아웃 요청 받음");
    
    // Refresh Token 무효화
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await this.refreshTokenService.revokeRefreshToken(refreshToken);
    }
    
    // Refresh Token 쿠키 삭제
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

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await this.userRepository.findByNicknameAndBirth(nickname, new Date(birth));
    console.log("사용자 찾기 완료");

    if (!user) {
      throw createNotFoundError("일치하는 정보를 찾을 수 없습니다");
    }

    console.log("이메일 찾기 성공:", user.email);

    const response: ApiResponse<{ email: string }> = {
      success: true,
      message: "이메일을 찾았습니다",
      data: { email: user.email },
    };

    res.json(response);
  });

  // 비밀번호 재설정
  resetPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("비밀번호 재설정 요청 받음:", req.body);
    
    const { email, nickname, birth, newPassword } = req.body;
    console.log("파싱된 데이터:", { email, nickname, birth });

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await this.userRepository.findByEmailNicknameAndBirth(email, nickname, new Date(birth));
    console.log("사용자 찾기 완료");

    if (!user) {
      throw createNotFoundError("일치하는 정보를 찾을 수 없습니다");
    }

    // 새 비밀번호 해시화
    console.log("새 비밀번호 해시화 시작");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("새 비밀번호 해시화 완료");

    // 비밀번호 업데이트
    console.log("비밀번호 업데이트 시작");
    await this.userRepository.updatePassword(Number(user.userId), hashedPassword);
    console.log("비밀번호 업데이트 완료");

    console.log("비밀번호 재설정 성공:", user.email);

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
      throw createAuthError("Refresh Token이 필요합니다");
    }

    // Refresh Token Rotation (보안 강화)
    const rotationResult = await this.refreshTokenService.rotateRefreshToken(refreshToken);
    
    if (!rotationResult) {
      throw createAuthError("유효하지 않은 Refresh Token입니다");
    }

    // 사용자 정보 조회
    console.log("사용자 정보 조회 시작");
    const user = await this.userRepository.findById(rotationResult.userId);
    console.log("사용자 정보 조회 완료");

    if (!user) {
      throw createAuthError("유효하지 않은 Refresh Token입니다");
    }

    // 새로운 Access Token 생성
    console.log("새로운 Access Token 생성 시작");
    const newAccessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      } as JWTPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );
    console.log("새로운 Access Token 생성 완료");

    // 새로운 Refresh Token을 쿠키에 설정
    res.cookie("refreshToken", rotationResult.newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    console.log("Access Token 갱신 성공:", user.email);

    const response: ApiResponse<{ accessToken: string }> = {
      success: true,
      message: "Access Token이 갱신되었습니다",
      data: { accessToken: newAccessToken },
    };

    res.json(response);
  });
} 