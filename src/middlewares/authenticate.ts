import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// JWT 토큰 검증 미들웨어
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "액세스 토큰이 필요합니다",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as {
      userId: number;
      email: string;
      authority: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "유효하지 않은 토큰입니다",
    });
  }
};
