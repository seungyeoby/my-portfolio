import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { uploadProfilePhoto, getProfilePhotoPath, getDefaultProfilePhoto } from "../middleware/upload.js";

const router = express.Router();

// 회원가입 유효성 검사 규칙
const signupValidation = [
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다")
    .matches(/^[a-zA-Z0-9가-힣]+$/)
    .withMessage("닉네임은 영문, 숫자, 한글만 사용 가능합니다"),
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 100 })
    .withMessage("비밀번호는 8자 이상이어야 합니다")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("유효한 성별을 선택해주세요"),
];

// 회원가입 API (파일 업로드 포함)
router.post("/sign-up", uploadProfilePhoto, signupValidation, async (req: Request, res: Response) => {
  try {
    console.log("회원가입 요청 받음:", req.body);
    console.log("업로드된 파일:", req.file);
    
    // 유효성 검사 오류 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("유효성 검사 오류:", errors.array());
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: errors.array(),
      });
    }

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

    // 이메일 중복 확인
    console.log("이메일 중복 확인 시작");
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });
    console.log("이메일 중복 확인 완료");

    if (existingEmail) {
      console.log("이메일 중복 발견");
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 이메일입니다",
      });
    }

    // 닉네임 중복 확인
    console.log("닉네임 중복 확인 시작");
    const existingNickname = await prisma.user.findUnique({
      where: { nickname },
    });
    console.log("닉네임 중복 확인 완료");

    if (existingNickname) {
      console.log("닉네임 중복 발견");
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다",
      });
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

// 로그인 유효성 검사 규칙
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일을 입력해주세요")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6, max: 13 })
    .withMessage("비밀번호는 6-13자 사이여야 합니다"),
];

// 로그인 API
router.post("/sign-in", loginValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "이메일 또는 비밀번호가 올바르지 않습니다",
      });
    }

    // JWT access token 생성 (7일) - BigInt를 Number로 변환
    const accessToken = jwt.sign(
      { 
        userId: Number(user.userId), // BigInt를 Number로 변환
        email: user.email,
        authority: user.authority 
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // JWT refresh token 생성 (30일) - BigInt를 Number로 변환
    const refreshToken = jwt.sign(
      { 
        userId: Number(user.userId), // BigInt를 Number로 변환
        type: "refresh"
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    // refresh token을 httpOnly cookie에 저장
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 전송
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    // access token만 JSON으로 반환
    res.json({
      accessToken,
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
router.get("/sign-out", async (req: Request, res: Response) => {
  try {
    console.log("로그아웃 요청 받음");
    
    // refresh token 쿠키 삭제
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    console.log("로그아웃 성공 - refresh token 쿠키 삭제됨");
    
    // 명세서에 맞는 응답 반환
    res.json({
      message: "로그아웃"
    });
  } catch (error) {
    console.error("로그아웃 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 아이디 찾기 유효성 검사 규칙
const findIdValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요")
    .normalizeEmail(),
];

// 아이디 찾기 API
router.post("/find-id", findIdValidation, async (req: Request, res: Response) => {
  try {
    console.log("아이디 찾기 요청 받음:", req.body);
    
    // 유효성 검사 오류 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("유효성 검사 오류:", errors.array());
      return res.status(400).json({
        success: false,
        message: "유효한 이메일 주소를 입력해주세요",
        errors: errors.array(),
      });
    }

    const { email } = req.body;
    console.log("이메일로 사용자 검색:", email);

    // 이메일로 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
      },
    });

    if (!user) {
      console.log("가입되지 않은 이메일:", email);
      return res.status(404).json({
        success: false,
        message: "가입되지 않은 이메일입니다",
      });
    }

    console.log("아이디 찾기 성공:", user.email);
    
    // 명세서에 맞는 응답 반환
    res.json({
      email: user.email,
    });
  } catch (error) {
    console.error("아이디 찾기 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 비밀번호 변경 유효성 검사 규칙
const resetPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요")
    .normalizeEmail(),
  body("currentPassword")
    .isLength({ min: 6, max: 13 })
    .withMessage("현재 비밀번호는 6-13자 사이여야 합니다"),
  body("newPassword")
    .isLength({ min: 6, max: 13 })
    .withMessage("새 비밀번호는 6-13자 사이여야 합니다")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"),
];

// 비밀번호 변경 API
router.put("/reset-password", resetPasswordValidation, async (req: Request, res: Response) => {
  try {
    console.log("비밀번호 변경 요청 받음:", req.body);
    
    // 유효성 검사 오류 확인
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("유효성 검사 오류:", errors.array());
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
        errors: errors.array(),
      });
    }

    const { email, currentPassword, newPassword } = req.body;
    console.log("비밀번호 변경 시도:", email);

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log("가입되지 않은 이메일:", email);
      return res.status(404).json({
        success: false,
        message: "가입되지 않은 이메일입니다",
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      console.log("현재 비밀번호 불일치:", email);
      return res.status(401).json({
        success: false,
        message: "현재 비밀번호가 올바르지 않습니다",
      });
    }

    // 새 비밀번호 해시화
    console.log("새 비밀번호 해시화 시작");
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log("새 비밀번호 해시화 완료");

    // 비밀번호 업데이트
    console.log("비밀번호 업데이트 시작");
    await prisma.user.update({
      where: { email },
      data: {
        password: hashedNewPassword,
      },
    });
    console.log("비밀번호 업데이트 완료");

    console.log("비밀번호 변경 성공:", email);
    
    // 명세서에 맞는 응답 반환
    res.json({
      message: "비밀번호가 변경되었습니다"
    });
  } catch (error) {
    console.error("비밀번호 변경 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// Access Token 갱신 API
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    console.log("Access Token 갱신 요청 받음");
    
    // 쿠키에서 refresh token 추출
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token이 없습니다",
      });
    }

    try {
      // refresh token 검증
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_SECRET || "your-secret-key"
      ) as {
        userId: number;
        type: string;
      };

      // refresh token 타입 확인
      if (decoded.type !== "refresh") {
        return res.status(403).json({
          success: false,
          message: "유효하지 않은 refresh token입니다",
        });
      }

      // 사용자 정보 조회
      const user = await prisma.user.findUnique({
        where: { userId: BigInt(decoded.userId) },
        select: {
          userId: true,
          email: true,
          authority: true,
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "사용자를 찾을 수 없습니다",
        });
      }

      // 새로운 access token 생성
      const newAccessToken = jwt.sign(
        { 
          userId: Number(user.userId),
          email: user.email,
          authority: user.authority 
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "7d" }
      );

      console.log("Access Token 갱신 성공:", user.email);
      
      // 새로운 access token 반환
      res.json({
        accessToken: newAccessToken,
      });
    } catch (jwtError) {
      console.log("Refresh token 검증 실패:", jwtError);
      return res.status(403).json({
        success: false,
        message: "유효하지 않은 refresh token입니다",
      });
    }
  } catch (error) {
    console.error("Access Token 갱신 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router; 