import { body } from "express-validator";

// 이메일 중복 확인 유효성 검사
export const checkEmailExists = async (email: string) => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });
  
  await prisma.$disconnect();
  return !!existingUser;
};

// 닉네임 중복 확인 유효성 검사
export const checkNicknameExists = async (nickname: string) => {
  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  
  const existingUser = await prisma.user.findUnique({
    where: { nickname },
  });
  
  await prisma.$disconnect();
  return !!existingUser;
};

// 사용자 정보 업데이트 유효성 검사
export const updateUserValidation = [
  body("nickname")
    .optional()
    .isLength({ min: 2, max: 20 })
    .withMessage("닉네임은 2-20자 사이여야 합니다")
    .matches(/^[a-zA-Z0-9가-힣]+$/)
    .withMessage("닉네임은 영문, 숫자, 한글만 사용 가능합니다"),
  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("유효한 생년월일을 입력해주세요"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "NONSPECIFIED"])
    .withMessage("유효한 성별을 선택해주세요"),
];

// 비밀번호 변경 유효성 검사
export const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("현재 비밀번호를 입력해주세요"),
  body("newPassword")
    .isLength({ min: 8, max: 100 })
    .withMessage("새 비밀번호는 8자 이상이어야 합니다")
    .matches(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
    .withMessage("새 비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다"),
  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("새 비밀번호가 일치하지 않습니다");
      }
      return true;
    }),
];