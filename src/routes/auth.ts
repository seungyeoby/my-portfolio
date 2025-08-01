import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { uploadProfilePhoto, getProfilePhotoPath, getDefaultProfilePhoto } from "../middleware/upload.js";
import { RefreshTokenService } from "../services/refreshTokenService.js";
import { 
  signupValidation, 
  signinValidation, 
  findIdValidation, 
  resetPasswordValidation,
  validateEmailNotExists,
  validateNicknameNotExists
} from "../middleware/validation.js";

const router = express.Router();

// 회원가입 API (파일 업로드 포함)
router.post("/sign-up", uploadProfilePhoto, signupValidation, validateEmailNotExists, validateNicknameNotExists, async (req: Request, res: Response) => {
  try {
    console.log("회원가입 요청 받음:", req.body);
    console.log("업로드된 파일:", req.file);
    
    const { nickname, email, password, birth, gender } = req.body;
    console.log("파싱된 데이터:", { nickname, email, birth, gender });

    // 프로필 사진 경로 설정
    let profilePhotoPath = null;
    if (req.file) {
      // 파일이 업로드된 경우
      profilePhotoPath = getProfilePhotoPath(req.file.filename);
      console.log("업로드된 프로필 사진 경로:", profilePhotoPath);
    } else {
      // 파일이 업로드되지 않은 경우 기본 이미지 사용
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
    const newUser = await prisma.user.create({
      data: {
        nickname,
        email,
        password: hashedPassword,
        birthDate: new Date(birth),
        gender,
        profilePhoto: profilePhotoPath,
        authority: "USER", // 기본값은 USER
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

    console.log("사용자 생성 완료:", newUser.email);

    res.status(201).json({
      success: true,
      message: "회원가입이 완료되었습니다",
      user: {
        userId: Number(newUser.userId),
        nickname: newUser.nickname,
        email: newUser.email,
        birthDate: newUser.birthDate,
        gender: newUser.gender,
        profilePhoto: newUser.profilePhoto,
        authority: newUser.authority,
      },
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 로그인 API
router.post("/sign-in", signinValidation, async (req: Request, res: Response) => {
  try {
    console.log("로그인 요청 받음:", req.body);
    
    const { email, password } = req.body;
    console.log("파싱된 데이터:", { email });

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await prisma.user.findUnique({
      where: { email },
    });
    console.log("사용자 찾기 완료");

    if (!user) {
      console.log("사용자를 찾을 수 없음");
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // 비밀번호 확인
    console.log("비밀번호 확인 시작");
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("비밀번호 확인 완료");

    if (!isPasswordValid) {
      console.log("비밀번호가 일치하지 않음");
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // JWT 토큰 생성
    console.log("JWT 토큰 생성 시작");
    const accessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // 보안 강화된 RefreshToken 생성
    const refreshToken = await RefreshTokenService.createRefreshToken(Number(user.userId));
    console.log("보안 RefreshToken 생성 완료");

    // Refresh Token을 HttpOnly 쿠키로 설정
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    console.log("로그인 성공:", user.email);

    res.json({
      success: true,
      message: "로그인이 완료되었습니다",
      accessToken,
      user: {
        userId: Number(user.userId),
        nickname: user.nickname,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender,
        profilePhoto: user.profilePhoto,
        authority: user.authority,
      },
    });
  } catch (error) {
    console.error("로그인 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 로그아웃 API
router.post("/sign-out", async (req: Request, res: Response) => {
  try {
    console.log("로그아웃 요청 받음");
    
    // Refresh Token 무효화
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await RefreshTokenService.revokeRefreshToken(refreshToken);
    }
    
    // Refresh Token 쿠키 삭제
    res.clearCookie("refreshToken");
    
    console.log("로그아웃 완료");
    
    res.json({
      success: true,
      message: "로그아웃이 완료되었습니다",
    });
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 이메일 찾기 API
router.post("/find-id", findIdValidation, async (req: Request, res: Response) => {
  try {
    console.log("이메일 찾기 요청 받음:", req.body);
    
    const { nickname, birth } = req.body;
    console.log("파싱된 데이터:", { nickname, birth });

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await prisma.user.findFirst({
      where: {
        nickname,
        birthDate: new Date(birth),
      },
      select: {
        email: true,
      },
    });
    console.log("사용자 찾기 완료");

    if (!user) {
      console.log("사용자를 찾을 수 없음");
      return res.status(404).json({
        success: false,
        message: "일치하는 정보를 찾을 수 없습니다",
      });
    }

    console.log("이메일 찾기 성공:", user.email);

    res.json({
      success: true,
      message: "이메일을 찾았습니다",
      email: user.email,
    });
  } catch (error) {
    console.error("이메일 찾기 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 비밀번호 재설정 API
router.post("/reset-password", resetPasswordValidation, async (req: Request, res: Response) => {
  try {
    console.log("비밀번호 재설정 요청 받음:", req.body);
    
    const { email, nickname, birth, newPassword } = req.body;
    console.log("파싱된 데이터:", { email, nickname, birth });

    // 사용자 찾기
    console.log("사용자 찾기 시작");
    const user = await prisma.user.findFirst({
      where: {
        email,
        nickname,
        birthDate: new Date(birth),
      },
    });
    console.log("사용자 찾기 완료");

    if (!user) {
      console.log("사용자를 찾을 수 없음");
      return res.status(404).json({
        success: false,
        message: "일치하는 정보를 찾을 수 없습니다",
      });
    }

    // 새 비밀번호 해시화
    console.log("새 비밀번호 해시화 시작");
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("새 비밀번호 해시화 완료");

    // 비밀번호 업데이트
    console.log("비밀번호 업데이트 시작");
    await prisma.user.update({
      where: { userId: user.userId },
      data: { password: hashedPassword },
    });
    console.log("비밀번호 업데이트 완료");

    console.log("비밀번호 재설정 성공:", user.email);

    res.json({
      success: true,
      message: "비밀번호가 성공적으로 재설정되었습니다",
    });
  } catch (error) {
    console.error("비밀번호 재설정 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// Access Token 갱신 API (보안 강화)
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    console.log("Access Token 갱신 요청 받음");
    
    // 쿠키에서 Refresh Token 추출
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      console.log("Refresh Token이 없음");
      return res.status(401).json({
        success: false,
        message: "Refresh Token이 필요합니다",
      });
    }

    // Refresh Token Rotation (보안 강화)
    const rotationResult = await RefreshTokenService.rotateRefreshToken(refreshToken);
    
    if (!rotationResult) {
      console.log("Refresh Token이 유효하지 않음");
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 Refresh Token입니다",
      });
    }

    // 사용자 정보 조회
    console.log("사용자 정보 조회 시작");
    const user = await prisma.user.findUnique({
      where: { userId: BigInt(rotationResult.userId) },
      select: {
        userId: true,
        email: true,
        authority: true,
      },
    });
    console.log("사용자 정보 조회 완료");

    if (!user) {
      console.log("사용자를 찾을 수 없음");
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 Refresh Token입니다",
      });
    }

    // 새로운 Access Token 생성
    console.log("새로운 Access Token 생성 시작");
    const newAccessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      },
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

    res.json({
      success: true,
      message: "Access Token이 갱신되었습니다",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Access Token 갱신 오류:", error);
    res.status(401).json({
      success: false,
      message: "유효하지 않은 Refresh Token입니다",
    });
  }
});

export default router; 