import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import crypto from "crypto";

export class RefreshTokenService {
  // RefreshToken 생성 및 저장
  static async createRefreshToken(userId: number): Promise<string> {
    // 랜덤 토큰 생성 (JWT 대신 암호학적으로 안전한 랜덤 문자열 사용)
    const token = crypto.randomBytes(64).toString('hex');
    
    // 만료일 설정 (30일)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 데이터베이스에 저장
    await prisma.refreshToken.create({
      data: {
        userId: BigInt(userId),
        token,
        expiresAt,
      },
    });

    return token;
  }

  // RefreshToken 검증
  static async verifyRefreshToken(token: string): Promise<{ userId: number; isValid: boolean }> {
    try {
      // 데이터베이스에서 토큰 조회
      const refreshToken = await prisma.refreshToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!refreshToken) {
        return { userId: 0, isValid: false };
      }

      // 토큰이 만료되었거나 무효화되었는지 확인
      if (refreshToken.isRevoked || refreshToken.expiresAt < new Date()) {
        return { userId: 0, isValid: false };
      }

      return { 
        userId: Number(refreshToken.userId), 
        isValid: true 
      };
    } catch (error) {
      console.error("RefreshToken 검증 오류:", error);
      return { userId: 0, isValid: false };
    }
  }

  // RefreshToken 무효화 (로그아웃 시)
  static async revokeRefreshToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.update({
        where: { token },
        data: { isRevoked: true },
      });
      return true;
    } catch (error) {
      console.error("RefreshToken 무효화 오류:", error);
      return false;
    }
  }

  // 사용자의 모든 RefreshToken 무효화 (보안 강화)
  static async revokeAllUserTokens(userId: number): Promise<boolean> {
    try {
      await prisma.refreshToken.updateMany({
        where: { 
          userId: BigInt(userId),
          isRevoked: false 
        },
        data: { isRevoked: true },
      });
      return true;
    } catch (error) {
      console.error("사용자 토큰 무효화 오류:", error);
      return false;
    }
  }

  // 만료된 토큰 정리 (정기적으로 실행)
  static async cleanupExpiredTokens(): Promise<number> {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          OR: [
            { expiresAt: { lt: new Date() } },
            { isRevoked: true }
          ]
        }
      });
      return result.count;
    } catch (error) {
      console.error("만료된 토큰 정리 오류:", error);
      return 0;
    }
  }

  // 토큰 재발급 (Refresh Token Rotation)
  static async rotateRefreshToken(oldToken: string): Promise<{ newToken: string; userId: number } | null> {
    try {
      // 기존 토큰 검증
      const { userId, isValid } = await this.verifyRefreshToken(oldToken);
      
      if (!isValid) {
        return null;
      }

      // 기존 토큰 무효화
      await this.revokeRefreshToken(oldToken);

      // 새 토큰 생성
      const newToken = await this.createRefreshToken(userId);

      return { newToken, userId };
    } catch (error) {
      console.error("토큰 재발급 오류:", error);
      return null;
    }
  }
} 