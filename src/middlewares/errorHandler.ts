import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types/index.js";

// 커스텀 에러 클래스
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Prisma 에러 처리
const handlePrismaError = (error: any): AppError => {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const field = error.meta?.target?.[0] || 'field';
      return new AppError(`${field}이(가) 이미 사용 중입니다`, 409);
    
    case 'P2025':
      // Record not found
      return new AppError('요청한 데이터를 찾을 수 없습니다', 404);
    
    case 'P2003':
      // Foreign key constraint violation
      return new AppError('관련된 데이터가 존재하지 않습니다', 400);
    
    default:
      return new AppError('데이터베이스 오류가 발생했습니다', 500);
  }
};

// JWT 에러 처리
const handleJWTError = (error: any): AppError => {
  switch (error.name) {
    case 'JsonWebTokenError':
      return new AppError('유효하지 않은 토큰입니다', 401);
    
    case 'TokenExpiredError':
      return new AppError('토큰이 만료되었습니다', 401);
    
    default:
      return new AppError('토큰 인증 오류가 발생했습니다', 401);
  }
};

// Validation 에러 처리
const handleValidationError = (error: any): AppError => {
  const errors = Object.values(error.errors).map((err: any) => err.message);
  const message = `입력 정보를 확인해주세요: ${errors.join(', ')}`;
  return new AppError(message, 400);
};

// Multer 에러 처리 (파일 업로드)
const handleMulterError = (error: any): AppError => {
  switch (error.code) {
    case 'LIMIT_FILE_SIZE':
      return new AppError('파일 크기가 너무 큽니다', 400);
    
    case 'LIMIT_FILE_COUNT':
      return new AppError('업로드할 수 있는 파일 개수를 초과했습니다', 400);
    
    case 'LIMIT_UNEXPECTED_FILE':
      return new AppError('예상하지 못한 파일이 업로드되었습니다', 400);
    
    default:
      return new AppError('파일 업로드 중 오류가 발생했습니다', 400);
  }
};

// 전역 에러 핸들러 미들웨어
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError: AppError;

  // 이미 AppError인 경우
  if (error instanceof AppError) {
    appError = error;
  } else {
    // 다른 타입의 에러를 AppError로 변환
    switch (error.name) {
      case 'PrismaClientKnownRequestError':
        appError = handlePrismaError(error);
        break;
      
      case 'JsonWebTokenError':
      case 'TokenExpiredError':
        appError = handleJWTError(error);
        break;
      
      case 'ValidationError':
        appError = handleValidationError(error);
        break;
      
      case 'MulterError':
        appError = handleMulterError(error);
        break;
      
      default:
        // 알 수 없는 에러
        appError = new AppError('서버 내부 오류가 발생했습니다', 500, false);
        break;
    }
  }

  // 개발 환경에서는 스택 트레이스 포함
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // 에러 로깅
  console.error('Error Details:', {
    message: appError.message,
    statusCode: appError.statusCode,
    stack: isDevelopment ? appError.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // 응답 생성
  const response: ApiResponse = {
    success: false,
    message: appError.message,
    ...(isDevelopment && { 
      stack: appError.stack,
      error: {
        name: error.name,
        message: error.message
      }
    })
  };

  // 상태 코드 설정
  const statusCode = appError.statusCode || 500;
  
  res.status(statusCode).json(response);
};

// 404 에러 핸들러
export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(`요청한 리소스를 찾을 수 없습니다: ${req.originalUrl}`, 404);
  next(error);
};

// 비동기 에러 래퍼 (컨트롤러에서 사용)
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 특정 에러 타입별 핸들러
export const createError = (message: string, statusCode: number = 500): AppError => {
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