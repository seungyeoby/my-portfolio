import { Request } from "express";

// 사용자 관련 타입
export interface User {
  userId: number;
  nickname: string;
  email: string;
  birthDate: Date;
  gender?: "MALE" | "FEMALE" | "NONSPECIFIED";
  profilePhoto?: string;
  authority: "USER" | "ADMIN";
}

// 인증 관련 타입
export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    authority: string;
  };
}

// JWT 토큰 페이로드 타입
export interface JWTPayload {
  userId: number;
  email: string;
  authority: string;
  iat?: number;
  exp?: number;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

// 로그인 요청 타입
export interface LoginRequest {
  email: string;
  password: string;
}

// 회원가입 요청 타입
export interface SignupRequest {
  nickname: string;
  email: string;
  password: string;
  birth: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

// 사용자 정보 수정 타입
export interface UpdateUserRequest {
  nickname?: string;
  birthDate?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  profilePhoto?: string;
}

// 비밀번호 변경 타입
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// 여행 정보 관련 타입
export interface TravelTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

export interface CreateTravelTipRequest {
  title: string;
  content: string;
  category: string;
}

export interface UpdateTravelTipRequest {
  title?: string;
  content?: string;
  category?: string;
}

// RefreshToken 관련 타입
export interface RefreshTokenData {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  createdAt: Date;
  isRevoked: boolean;
}

// 파일 업로드 관련 타입
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

// 검증 오류 타입
export interface ValidationError {
  type: string;
  value: any;
  msg: string;
  path: string;
  location: string;
}
