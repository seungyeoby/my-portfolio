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
      console.log("❌ 사용자 없음:", userInfo.email);
      throw new Error("UserNotFound");
    }

    console.log("✅ 사용자 존재:", user.email);
    console.log("입력한 비밀번호:", userInfo.password);
    console.log("DB 저장된 해시:", user.password);

    const isPasswordVerified = await bcrypt.compare(
      userInfo.password,
      user.password
    );

    if (!isPasswordVerified) {
      console.log("❌ 비밀번호 불일치");
      throw new Error("PasswordError");
    }

    console.log("✅ 로그인 성공");

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

  async getUserNickname(userId: number) {
    const nickname = await this.userRepo.getUserNickname(userId);

    if (!nickname) {
      throw new Error("UserNotFound");
    }

    return nickname;
  }
}
