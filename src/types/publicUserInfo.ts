import { Authority, Gender } from "@prisma/client";

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
