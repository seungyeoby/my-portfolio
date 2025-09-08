import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JWTPayload } from "../types/index.js";
import { config } from "dotenv";
config();

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하여 검증
 */
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken;

console.log("aasdasdsaddadadadsddddad", token)

  if (!token) {

    return res.status(401).json({
      success: false,
      message: "액세스 토큰이 필요합니다",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET_KEY || "your-secret-key"
    ) as JWTPayload;

    // 검증된 사용자 정보를 request 객체에 추가
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "유효하지 않은 토큰입니다",
    });
  }
};

/**
 * 관리자 권한 검증 미들웨어
 * 사용자가 로그인되어 있고 ADMIN 권한을 가지고 있는지 확인
 */
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "인증이 필요합니다",
    });
  }

  if (req.user.authority !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "관리자 권한이 필요합니다",
    });
  }

  next();
};

/**
 * 사용자 권한 검증 미들웨어
 * 사용자가 로그인되어 있고 특정 사용자 ID와 일치하는지 확인
 */
export const requireUser = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "인증이 필요합니다",
    });
  }

  // URL 파라미터에서 userId 추출 (예: /users/:userId)
  const requestedUserId = parseInt(req.params.userId);

  if (req.user.userId !== requestedUserId && req.user.authority !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "해당 리소스에 접근할 권한이 없습니다",
    });
  }

  next();
};
