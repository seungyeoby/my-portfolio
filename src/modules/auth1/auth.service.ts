import UserRepository from "../../repositories/user.repository.js";
import { SignUpInfo, SignInInfo, PublicUserInfo } from "../../types/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export default class AuthService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async signUp(userInfo: SignUpInfo) {
    const existingUser = await this.userRepo.findByEmail(userInfo.email);

    if (existingUser) {
      throw new Error("EmailAlreadyExists");
    }

    const existingNickname = await this.userRepo.findByNickname(
      userInfo.nickname
    );

    if (existingNickname) {
      throw new Error("NicknameAlreadyExists");
    }

    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const bcryptPassword = await bcrypt.hash(userInfo.password, salt);

    const birthDate = new Date(userInfo.birthDate);

    const signUpUserInfo = {
      ...userInfo,
      password: bcryptPassword,
      birthDate,
    };

    await this.userRepo.createUser(signUpUserInfo);
  }

  async signIn(userInfo: SignInInfo) {
    const user = await this.userRepo.findByEmail(userInfo.email);

    if (!user) {
      throw new Error("UserNotFound");
    }

    const isPasswordVerified = await bcrypt.compare(
      userInfo.password,
      user.password
    );

    if (!isPasswordVerified) {
      throw new Error("PasswordError");
    }

    const publicUserInfo: PublicUserInfo = {
      email: user.email,
      nickname: user.nickname,
      birthDate: user.birthDate,
      profilePhoto: user.profilePhoto || undefined,
      gender: user.gender,
      authority: user.authority,
    };

    const token = jwt.sign(
      {
        userId: user.userId,
      },
      process.env.SECRET_KEY!,
      {
        expiresIn: "10h",
      }
    );

    return { publicUserInfo, token };
  }

  // 로그아웃 (현재는 단순히 성공 응답만 반환)
  async signOut() {
    // 실제 구현에서는 토큰 블랙리스트나 세션 관리가 필요할 수 있음
    return { message: "로그아웃이 완료되었습니다" };
  }

  // 이메일 찾기
  async findId(nickname: string, birthDate: string): Promise<string> {
    const user = await this.userRepo.findByNicknameAndBirth(
      nickname,
      new Date(birthDate)
    );

    if (!user) {
      throw new Error("UserInfoNotFound");
    }

    return user.email;
  }

  // 비밀번호 재설정
  async resetPassword(
    email: string,
    nickname: string,
    birthDate: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepo.findByEmailNicknameAndBirth(
      email,
      nickname,
      new Date(birthDate)
    );

    if (!user) {
      throw new Error("UserInfoNotFound");
    }

    // 새 비밀번호 해시화
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 비밀번호 업데이트
    await this.userRepo.updatePassword(Number(user.userId), hashedPassword);
  }
}
