import { RefreshTokenService } from "../services/refreshTokenService.js";

// 만료된 토큰 정리 스케줄러
export class TokenCleanupScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private refreshTokenService: RefreshTokenService;

  constructor() {
    this.refreshTokenService = new RefreshTokenService();
  }

  // 스케줄러 시작 (매일 자정에 실행)
  start(): void {
    console.log("토큰 정리 스케줄러 시작");
    
    // 매일 자정에 실행
    this.intervalId = setInterval(async () => {
      try {
        const cleanedCount = await this.refreshTokenService.cleanupExpiredTokens();
        console.log(`만료된 토큰 ${cleanedCount}개 정리 완료`);
      } catch (error) {
        console.error("토큰 정리 중 오류:", error);
      }
    }, 24 * 60 * 60 * 1000); // 24시간

    // 서버 시작 시 즉시 한 번 실행
    this.runCleanup();
  }

  // 스케줄러 중지
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("토큰 정리 스케줄러 중지");
    }
  }

  // 수동으로 토큰 정리 실행
  async runCleanup(): Promise<number> {
    try {
      const cleanedCount = await this.refreshTokenService.cleanupExpiredTokens();
      console.log(`수동 토큰 정리 완료: ${cleanedCount}개`);
      return cleanedCount;
    } catch (error) {
      console.error("수동 토큰 정리 중 오류:", error);
      return 0;
    }
  }
} 