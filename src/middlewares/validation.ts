import { param, validationResult, body } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const reviewValidator = [
  param("reviewId")
    .notEmpty()
    .withMessage("reviewId가 없습니다.")
    .isInt()
    .withMessage("id가 숫자여야 합니다."),
];

export const checklistValidator = [
  param("checklistId")
    .notEmpty()
    .withMessage("checklistId가 없습니다.")
    .isInt()
    .withMessage("id가 숫자여야 합니다."),
];

export const handleValidationResult = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedError = errors.array().map((err) => err.msg);
    console.log(extractedError);
    return next(new Error("InputValidation"));
  }
  next();
};

// Auth 관련 validation 함수들
export const signupValidation = [
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다"),
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("비밀번호는 8자 이상이어야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("gender")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("유효한 성별을 선택해주세요"),
  handleValidationResult,
];

export const signinValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요"),
  body("password")
    .notEmpty()
    .withMessage("비밀번호를 입력해주세요"),
  handleValidationResult,
];

export const findIdValidation = [
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  handleValidationResult,
];

export const resetPasswordValidation = [
  body("email")
    .isEmail()
    .withMessage("유효한 이메일 주소를 입력해주세요"),
  body("nickname")
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다"),
  body("birth")
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("새 비밀번호는 8자 이상이어야 합니다"),
  handleValidationResult,
];

export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("현재 비밀번호를 입력해주세요"),
  body("newPassword")
    .isLength({ min: 8 })
    .withMessage("새 비밀번호는 8자 이상이어야 합니다"),
  handleValidationResult,
];

// Travel 관련 validation 함수들
export const travelInfoValidation = [
  // 여행 정보 조회 validation (임시로 통과)
  (req: Request, res: Response, next: NextFunction) => next(),
];

export const getTravelTipByIdValidation = [
  param("id")
    .notEmpty()
    .withMessage("여행정보 ID가 없습니다.")
    .isInt()
    .withMessage("ID가 숫자여야 합니다."),
  handleValidationResult,
];

export const createTravelTipValidation = [
  body("title")
    .notEmpty()
    .withMessage("제목을 입력해주세요"),
  body("content")
    .notEmpty()
    .withMessage("내용을 입력해주세요"),
  body("category")
    .notEmpty()
    .withMessage("카테고리를 선택해주세요"),
  handleValidationResult,
];

export const updateTravelTipValidation = [
  param("id")
    .notEmpty()
    .withMessage("여행정보 ID가 없습니다.")
    .isInt()
    .withMessage("ID가 숫자여야 합니다."),
  handleValidationResult,
];

export const deleteTravelTipValidation = [
  param("id")
    .notEmpty()
    .withMessage("여행정보 ID가 없습니다.")
    .isInt()
    .withMessage("ID가 숫자여야 합니다."),
  handleValidationResult,
];

export const validateEmailNotExists = (req: Request, res: Response, next: NextFunction) => {
  // 이메일 중복 확인 로직 (임시로 통과)
  next();
};

export const validateNicknameNotExists = (req: Request, res: Response, next: NextFunction) => {
  // 닉네임 중복 확인 로직 (임시로 통과)
  next();
};

export const validateCurrentPassword = (req: Request, res: Response, next: NextFunction) => {
  // 현재 비밀번호 확인 로직 (임시로 통과)
  next();
};
