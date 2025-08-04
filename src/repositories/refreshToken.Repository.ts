// import prisma from "../lib/prisma.js";
// import { RefreshTokenData } from "../types/index.js";

// export class RefreshTokenRepository {
//   // 토큰으로 RefreshToken 찾기
//   async findByToken(token: string) {
//     return await prisma.refreshToken.findUnique({
//       where: { token },
//       include: { user: true },
//     });
//   }

//   // 사용자 ID로 모든 RefreshToken 찾기
//   async findByUserId(userId: number) {
//     return await prisma.refreshToken.findMany({
//       where: { userId: BigInt(userId) },
//     });
//   }

//   // RefreshToken 생성
//   async create(tokenData: {
//     userId: number;
//     token: string;
//     expiresAt: Date;
//   }) {
//     return await prisma.refreshToken.create({
//       data: {
//         userId: BigInt(tokenData.userId),
//         token: tokenData.token,
//         expiresAt: tokenData.expiresAt,
//       },
//     });
//   }

//   // RefreshToken 무효화
//   async revoke(token: string) {
//     return await prisma.refreshToken.update({
//       where: { token },
//       data: { isRevoked: true },
//     });
//   }

//   // 사용자의 모든 RefreshToken 무효화
//   async revokeAllByUserId(userId: number) {
//     return await prisma.refreshToken.updateMany({
//       where: {
//         userId: BigInt(userId),
//         isRevoked: false
//       },
//       data: { isRevoked: true },
//     });
//   }

//   // 만료된 토큰 삭제
//   async deleteExpired() {
//     return await prisma.refreshToken.deleteMany({
//       where: {
//         OR: [
//           { expiresAt: { lt: new Date() } },
//           { isRevoked: true }
//         ]
//       }
//     });
//   }

//   // 토큰 개수 조회
//   async countByUserId(userId: number) {
//     return await prisma.refreshToken.count({
//       where: { userId: BigInt(userId) },
//     });
//   }

//   // 활성 토큰 개수 조회
//   async countActiveByUserId(userId: number) {
//     return await prisma.refreshToken.count({
//       where: {
//         userId: BigInt(userId),
//         isRevoked: false,
//         expiresAt: { gt: new Date() }
//       },
//     });
//   }
// }
