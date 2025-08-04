import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RefreshTokenService } from "../../services/refreshTokenService.js";
import { UserRepository } from "../../repositories/user.repository.js";
import { uploadProfilePhoto, getProfilePhotoPath, getDefaultProfilePhoto } from "../../middlewares/upload.js";
import { 
  User, 
  LoginRequest, 
  SignupRequest,
  JWTPayload 
} from "../../types/index.js";

export class AuthService {
  private refreshTokenService: RefreshTokenService;
  private userRepository: UserRepository;

  constructor() {
    this.refreshTokenService = new RefreshTokenService();
    this.userRepository = new UserRepository();
  }

  // 회원가입
  async signup(signupData: SignupRequest, profilePhoto?: Express.Multer.File): Promise<User> {
    // 프로필 사진 경로 설정
    let profilePhotoPath: string;
    if (profilePhoto) {
      const uploadedPath = getProfilePhotoPath(profilePhoto.filename);
      profilePhotoPath = uploadedPath || getDefaultProfilePhoto();
    } else {
      profilePhotoPath = getDefaultProfilePhoto();
    }

    // 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(signupData.password, saltRounds);

    // 사용자 생성
    const newUser = await this.userRepository.create({
      nickname: signupData.nickname,
      email: signupData.email,
      password: hashedPassword,
      birthDate: new Date(signupData.birth),
      gender: signupData.gender,
      profilePhoto: profilePhotoPath,
    });

    return {
      userId: Number(newUser.userId),
      nickname: newUser.nickname,
      email: newUser.email,
      birthDate: newUser.birthDate,
      gender: newUser.gender || undefined,
      profilePhoto: newUser.profilePhoto || undefined,
      authority: newUser.authority,
    };
  }

  // 로그인
  async signin(loginData: LoginRequest): Promise<{ accessToken: string; user: User; refreshToken: string }> {
    // 사용자 찾기
    const user = await this.userRepository.findByEmail(loginData.email);

    if (!user) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // 비밀번호 확인
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordValid) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다");
    }

    // JWT 토큰 생성
    const accessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      } as JWTPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    // 보안 강화된 RefreshToken 생성
    const refreshToken = await this.refreshTokenService.createRefreshToken(Number(user.userId));

    return {
      accessToken,
      refreshToken,
      user: {
        userId: Number(user.userId),
        nickname: user.nickname,
        email: user.email,
        birthDate: user.birthDate,
        gender: user.gender || undefined,
        profilePhoto: user.profilePhoto || undefined,
        authority: user.authority,
      },
    };
  }

  // 로그아웃
  async signout(refreshToken: string): Promise<void> {
    await this.refreshTokenService.revokeRefreshToken(refreshToken);
  }

  // 이메일 찾기
  async findId(nickname: string, birth: string): Promise<string> {
    const user = await this.userRepository.findByNicknameAndBirth(nickname, new Date(birth));

    if (!user) {
      throw new Error("일치하는 정보를 찾을 수 없습니다");
    }

    return user.email;
  }

  // 비밀번호 재설정
  async resetPassword(email: string, nickname: string, birth: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findByEmailNicknameAndBirth(email, nickname, new Date(birth));

    if (!user) {
      throw new Error("일치하는 정보를 찾을 수 없습니다");
    }

    // 새 비밀번호 해시화
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 비밀번호 업데이트
    await this.userRepository.updatePassword(Number(user.userId), hashedPassword);
  }

  // Access Token 갱신
  async refresh(refreshToken: string): Promise<{ accessToken: string; newRefreshToken: string }> {
    // Refresh Token Rotation (보안 강화)
    const rotationResult = await this.refreshTokenService.rotateRefreshToken(refreshToken);
    
    if (!rotationResult) {
      throw new Error("유효하지 않은 Refresh Token입니다");
    }

    // 사용자 정보 조회
    const user = await this.userRepository.findById(rotationResult.userId);

    if (!user) {
      throw new Error("유효하지 않은 Refresh Token입니다");
    }

    // 새로운 Access Token 생성
    const newAccessToken = jwt.sign(
      { 
        userId: Number(user.userId),
        email: user.email,
        authority: user.authority 
      } as JWTPayload,
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    return {
      accessToken: newAccessToken,
      newRefreshToken: rotationResult.newToken,
    };
  }
} 