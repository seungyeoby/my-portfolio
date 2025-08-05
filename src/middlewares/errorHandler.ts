import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/index.js";

// 커스텀 에러 클래스
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// 전역 에러 핸들러 미들웨어
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error Details:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  switch (err.message) {
    // 인증 관련 에러
    case "AuthenticationError":
      return res.status(401).json({
        success: false,
        message: "해당 권한이 없음",
      });

    case "UserNotFound":
      return res.status(404).json({
        success: false,
        message: "사용자를 찾을 수 없음",
      });

    case "PasswordError":
      return res.status(401).json({
        success: false,
        message: "비밀번호가 일치하지 않습니다",
      });

    case "InputValidation":
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
      });

    // 데이터베이스 관련 에러
    case "DataBaseError":
      return res.status(500).json({
        success: false,
        message: "데이터베이스 오류",
      });

    // 유효성 검사 에러
    case "ValidationError":
      return res.status(400).json({
        success: false,
        message: "입력 정보를 확인해주세요",
      });

    case "EmailAlreadyExists":
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 이메일입니다",
      });

    case "NicknameAlreadyExists":
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 닉네임입니다",
      });

    case "UserInfoNotFound":
      return res.status(404).json({
        success: false,
        message: "사용자 정보를 찾을 수 없습니다",
      });

    // 토큰 관련 에러
    case "JsonWebTokenError":
      return res.status(401).json({
        success: false,
        message: "유효하지 않은 토큰입니다",
      });

    case "TokenExpiredError":
      return res.status(401).json({
        success: false,
        message: "토큰이 만료되었습니다",
      });

    // 파일 업로드 에러
    case "LIMIT_FILE_SIZE":
      return res.status(400).json({
        success: false,
        message: "파일 크기가 너무 큽니다",
      });

    case "LIMIT_FILE_COUNT":
      return res.status(400).json({
        success: false,
        message: "업로드할 수 있는 파일 개수를 초과했습니다",
      });

    // Prisma 에러
    case "P2002":
      return res.status(409).json({
        success: false,
        message: "이미 사용 중인 데이터입니다",
      });

    case "P2025":
      return res.status(404).json({
        success: false,
        message: "요청한 데이터를 찾을 수 없습니다",
      });

    case "P2003":
      return res.status(400).json({
        success: false,
        message: "관련된 데이터가 존재하지 않습니다",
      });

    // 기본 에러
    default:
      return res.status(500).json({
        success: false,
        message: "서버 내부 오류가 발생했습니다",
      });
  }
};

// 404 에러 핸들러
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`,
    404
  );
  next(error);
};

// 비동기 에러 래퍼 (컨트롤러에서 사용)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 특정 에러 타입별 핸들러
export const createError = (
  message: string,
  statusCode: number = 500
): AppError => {
  return new AppError(message, statusCode);
};

export const createValidationError = (message: string): AppError => {
  return new AppError(message, 400);
};

export const createAuthError = (message: string): AppError => {
  return new AppError(message, 401);
};

export const createForbiddenError = (message: string): AppError => {
  return new AppError(message, 403);
};

export const createNotFoundError = (message: string): AppError => {
  return new AppError(message, 404);
};

export const createConflictError = (message: string): AppError => {
  return new AppError(message, 409);
};
