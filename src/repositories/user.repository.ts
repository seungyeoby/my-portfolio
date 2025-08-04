import prisma from "../lib/prisma.js";
import { User } from "../types/index.js";
import { UpdatedUserInfo, SignUpInfo, SignInInfo } from "../types/user.js";

export default class UserRepository {
  async getPublicPersonalInfo(userId: number) {
    try {
      return await prisma.user.findFirst({
        where: {
          userId,
        },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  async updatePersonalInfo(userId: number, updatedInfo: UpdatedUserInfo) {
    try {
      return await prisma.user.update({
        where: { userId },
        data: { ...updatedInfo },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  // auth1 - 회원가입
  async createUser(userInfo: SignUpInfo) {
    try {
      return await prisma.user.create({
        data: { ...userInfo },
      });
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }

  // 이메일로 사용자 찾기
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  // // ID로 사용자 찾기
  // async findById(userId: number) {
  //   return await prisma.user.findUnique({
  //     where: { userId: BigInt(userId) },
  //     select: {
  //       userId: true,
  //       nickname: true,
  //       email: true,
  //       birthDate: true,
  //       gender: true,
  //       profilePhoto: true,
  //       authority: true,
  //     },
  //   });
  // }

  // // 닉네임으로 사용자 찾기
  // async findByNickname(nickname: string) {
  //   return await prisma.user.findUnique({
  //     where: { nickname },
  //   });
  // }

  // // 닉네임과 생년월일로 사용자 찾기
  // async findByNicknameAndBirth(nickname: string, birthDate: Date) {
  //   return await prisma.user.findFirst({
  //     where: {
  //       nickname,
  //       birthDate,
  //     },
  //     select: {
  //       email: true,
  //     },
  //   });
  // }

  // // 이메일, 닉네임, 생년월일로 사용자 찾기
  // async findByEmailNicknameAndBirth(
  //   email: string,
  //   nickname: string,
  //   birthDate: Date
  // ) {
  //   return await prisma.user.findFirst({
  //     where: {
  //       email,
  //       nickname,
  //       birthDate,
  //     },
  //   });
  // }

  // // 사용자 생성
  // async create(userData: {
  //   nickname: string;
  //   email: string;
  //   password: string;
  //   birthDate: Date;
  //   gender: "MALE" | "FEMALE" | "OTHER";
  //   profilePhoto: string;
  // }) {
  //   return await prisma.user.create({
  //     data: {
  //       ...userData,
  //       authority: "USER",
  //     },
  //     select: {
  //       userId: true,
  //       nickname: true,
  //       email: true,
  //       birthDate: true,
  //       gender: true,
  //       profilePhoto: true,
  //       authority: true,
  //     },
  //   });
  // }

  // // 사용자 정보 업데이트
  // async update(
  //   userId: number,
  //   updateData: {
  //     nickname?: string;
  //     birthDate?: Date;
  //     gender?: "MALE" | "FEMALE" | "OTHER";
  //     profilePhoto?: string;
  //   }
  // ) {
  //   return await prisma.user.update({
  //     where: { userId: BigInt(userId) },
  //     data: updateData,
  //     select: {
  //       userId: true,
  //       nickname: true,
  //       email: true,
  //       birthDate: true,
  //       gender: true,
  //       profilePhoto: true,
  //       authority: true,
  //     },
  //   });
  // }

  // // 비밀번호 업데이트
  // async updatePassword(userId: number, hashedPassword: string) {
  //   return await prisma.user.update({
  //     where: { userId: BigInt(userId) },
  //     data: { password: hashedPassword },
  //   });
  // }

  // // 사용자 삭제
  // async delete(userId: number) {
  //   return await prisma.user.delete({
  //     where: { userId: BigInt(userId) },
  //   });
  // }

  // // 닉네임 중복 확인 (업데이트용)
  // async findNicknameDuplicate(nickname: string, excludeUserId: number) {
  //   return await prisma.user.findFirst({
  //     where: {
  //       nickname,
  //       userId: { not: BigInt(excludeUserId) },
  //     },
  //   });
  // }
}
