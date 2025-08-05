import bcrypt from "bcrypt";
import { UserRepository } from "../../repositories/user.repository.js";
import { RefreshTokenService } from "../../services/refreshTokenService.js";
import { Checklist, ChangedChecklistItems } from "../../types/checklist.js";
import { UpdatedUserInfo } from "../../types/user.js";

export class UserService {
  private userRepository: UserRepository;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenService = new RefreshTokenService();
  }

  // 개인정보 조회
  async getPublicPersonalInfo(userId: number) {
    const userInfo = await this.userRepository.findById(userId);
    if (!userInfo) {
      throw new Error("UserNotFound");
    }
    return userInfo;
  }

  // 개인정보 수정
  async updatePersonalInfo(userId: number, updatedInfo: UpdatedUserInfo) {
    if (updatedInfo.birthDate) {
      updatedInfo.birthDate = new Date(updatedInfo.birthDate);
    }

    const updatedUser = await this.userRepository.update(userId, updatedInfo);
    return updatedUser;
  }

  // 전체 준비물 리뷰 조회
  async getAllReviews(userId: number) {
    // TODO: 구현 필요
    return [];
  }

  // 개별 준비물 리뷰 조회
  async getReviewByReviewId(userId: number, reviewId: number) {
    // TODO: 구현 필요
    return null;
  }

  // 내가 공유한 체크리스트 전체 조회
  async getSharedChecklists(userId: number) {
    // TODO: 구현 필요
    return [];
  }

  // 내가 공유한 개별 체크리스트 조회
  async getSharedChecklist(userId: number, checklistId: number) {
    // TODO: 구현 필요
    return null;
  }

  // 전체 체크리스트 조회
  async getChecklistsByUserId(userId: number) {
    // TODO: 구현 필요
    return [];
  }

  // 개별 체크리스트 조회
  async getChecklistByReviewId(userId: number, checklistId: number) {
    // TODO: 구현 필요
    return null;
  }

  // 체크리스트 생성
  async createChecklist(checklist: Checklist) {
    // TODO: 구현 필요
  }

  // 체크리스트 수정
  async updateChecklist(checklistId: number, change: ChangedChecklistItems) {
    // TODO: 구현 필요
  }

  // 체크리스트 삭제
  async deleteChecklist(checklistId: number) {
    // TODO: 구현 필요
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
