import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, JWTPayload } from "../types/index.js";

// JWT 토큰 검증 미들웨어
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    // 1. 요청에서 토큰 추출
    // 2. 토큰 유효성 검사
    // 3. 검증 성공 시 다음 단계로 진행
    // 4. 실패 시 에러 응답
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "액세스 토큰이 필요합니다",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as JWTPayload;
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "유효하지 않은 토큰입니다",
    });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
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