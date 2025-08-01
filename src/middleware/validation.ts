import { Request, Response, NextFunction } from "express";
import { validationResult, body, param, query } from "express-validator";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

// 유효성검사 결과 처리 미들웨어
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "입력 정보를 확인해주세요",
      errors: errors.array(),
    });
  }
  next();
};

// ===== 인증 관련 유효성검사 =====

// 회원가입 유효성검사
export const signupValidation = [
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
  handleValidationErrors,
];

// 로그인 유효성검사
export const signinValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("비밀번호를 입력해주세요"),
  handleValidationErrors,
];

// 이메일 찾기 유효성검사
export const findIdValidation = [
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  handleValidationErrors,
];

// 비밀번호 재설정 유효성검사
export const resetPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요")
    .normalizeEmail(),
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("newPassword")
    .isLength({ min: 8, max: 100 })
    .withMessage("새 비밀번호는 8자 이상이어야 합니다")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"),
  handleValidationErrors,
];

// 사용자 정보 수정 유효성검사
export const updateUserValidation = [
  body("nickname")
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다")
    .matches(/^[a-zA-Z0-9가-힣]+$/)
    .withMessage("닉네임은 영문, 숫자, 한글만 사용 가능합니다"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("유효한 성별을 선택해주세요"),
  handleValidationErrors,
];

// 비밀번호 변경 유효성검사
export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("현재 비밀번호를 입력해주세요"),
  body("newPassword")
    .isLength({ min: 8, max: 100 })
    .withMessage("새 비밀번호는 8자 이상이어야 합니다")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("새 비밀번호가 일치하지 않습니다");
      }
      return true;
    }),
  handleValidationErrors,
];

// ===== 여행정보 관련 유효성검사 =====

// 여행정보 조회 유효성검사
export const travelInfoValidation = [
  query("category")
    .optional()
    .isIn(["PASSPORT", "ELECTRONICS", "CLOTHING", "DOCUMENTS", "MONEY", "HEALTH", "TRANSPORTATION", "CULTURE"])
    .withMessage("유효한 카테고리를 선택해주세요"),
  handleValidationErrors,
];

// 여행정보 생성 유효성검사
export const createTravelTipValidation = [
  body("title")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("제목은 1자 이상 100자 이하여야 합니다"),
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("내용은 1자 이상 1000자 이하여야 합니다"),
  body("category")
    .isIn(["PASSPORT", "ELECTRONICS", "CLOTHING", "DOCUMENTS", "MONEY", "HEALTH", "TRANSPORTATION", "CULTURE"])
    .withMessage("유효한 카테고리를 선택해주세요"),
  handleValidationErrors,
];

// 여행정보 수정 유효성검사
export const updateTravelTipValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("유효한 ID를 입력해주세요"),
  body("title")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("제목은 1자 이상 100자 이하여야 합니다"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("내용은 1자 이상 1000자 이하여야 합니다"),
  body("category")
    .optional()
    .isIn(["PASSPORT", "ELECTRONICS", "CLOTHING", "DOCUMENTS", "MONEY", "HEALTH", "TRANSPORTATION", "CULTURE"])
    .withMessage("유효한 카테고리를 선택해주세요"),
  handleValidationErrors,
];

// 여행정보 삭제 유효성검사
export const deleteTravelTipValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("유효한 ID를 입력해주세요"),
  handleValidationErrors,
];

// 개별 여행정보 조회 유효성검사
export const getTravelTipByIdValidation = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("유효한 ID를 입력해주세요"),
  handleValidationErrors,
];

// ===== 커스텀 유효성검사 함수 =====

// 이메일 중복 확인
export const checkEmailExists = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  return !!existingUser;
};

// 닉네임 중복 확인
export const checkNicknameExists = async (nickname: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { nickname },
  });
  return !!existingUser;
};

// ===== 커스텀 유효성검사 미들웨어 =====

// 이메일 중복 확인 미들웨어
export const validateEmailNotExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    const exists = await checkEmailExists(email);
    
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 이메일입니다",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
};

// 닉네임 중복 확인 미들웨어
export const validateNicknameNotExists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nickname } = req.body;
    const exists = await checkNicknameExists(nickname);
    
    if (exists) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
};

// 닉네임 중복 확인 미들웨어 (기존 사용자 제외)
export const validateNicknameNotExistsForUpdate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { nickname } = req.body;
    const userId = (req as any).user?.userId; // AuthRequest에서 userId 가져오기
    
    if (!nickname) {
      return next(); // 닉네임이 변경되지 않는 경우 스킵
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        nickname,
        userId: { not: userId },
      },
    });
    
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다",
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
}; 

// 현재 비밀번호 확인 미들웨어
export const validateCurrentPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentPassword } = req.body;
    const userId = (req as any).user?.userId;

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "현재 비밀번호를 입력해주세요",
      });
    }

    // 현재 사용자 정보 조회
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없습니다",
      });
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "현재 비밀번호가 올바르지 않습니다",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
}; 