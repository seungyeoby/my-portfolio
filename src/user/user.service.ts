import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshTokenService } from "../services/refreshTokenService.js";

export class UserService {
  private userRepository: UserRepository;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenService = new RefreshTokenService();
  }

  // 비밀번호 변경
  async changePassword(userId: number, newPassword: string): Promise<void> {
    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.userRepository.updatePassword(userId, hashedNewPassword);

    // 보안 강화: 비밀번호 변경 시 모든 RefreshToken 무효화
    await this.refreshTokenService.revokeAllUserTokens(userId);
  }

  // 회원 탈퇴
  async deleteAccount(userId: number): Promise<void> {
    // 사용자 삭제 (CASCADE로 인해 관련 데이터도 함께 삭제됨)
    await this.userRepository.delete(userId);
  }
} 