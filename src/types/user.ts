import { Authority, Gender } from "@prisma/client";

export type SignUpInfo = {
  nickname: string;
  email: string;
  password: string;
  birthDate: Date;
  profilePhoto?: string;
  gender: Gender;
  authority: Authority;
};

export type SignInInfo = {
  email: string;
  password: string;
};

export type PublicUserInfo = {
  nickname: string;
  email: string;
  birthDate: Date;
  profilePhoto?: string;
  gender: Gender;
  authority: Authority;
};

export type UpdatedUserInfo = Partial<
  Pick<PublicUserInfo, "nickname" | "birthDate" | "profilePhoto">
>;
