import multer from "multer";
import path from "path";
import fs from "fs";

// 업로드 디렉토리 생성
const uploadDir = "uploads";
const profileDir = path.join(uploadDir, "profiles");
const itemImageDir = path.join(uploadDir, "item-images");

// 디렉토리가 없으면 생성
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

if (!fs.existsSync(itemImageDir)) {
  fs.mkdirSync(itemImageDir, { recursive: true });
}

// 파일 저장 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileDir);
  },
  filename: (req, file, cb) => {
    // 파일명: timestamp_originalname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `profile_${uniqueSuffix}${ext}`);
  },
});

// 파일 필터링
const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // 허용할 파일 타입
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "지원하지 않는 파일 형식입니다. JPG, PNG, GIF만 업로드 가능합니다."
      )
    );
  }
};

// multer 설정
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB 제한
  },
});

// 프로필 사진 업로드 미들웨어
export const uploadProfilePhoto = upload.single("profilePhoto");

// 파일 삭제 함수
export const deleteFile = (filename: string) => {
  const filePath = path.join(profileDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// 파일 경로 생성 함수
export const getProfilePhotoPath = (filename: string) => {
  if (!filename) return null;
  return `/uploads/profiles/${filename}`;
};

// 기본 프로필 이미지 경로 반환 함수
export const getDefaultProfilePhoto = () => {
  return "/images/default-profile.svg";
};

// 아이템 이미지 업로드 설정
export const uploadItemImage = multer({
  storage: storage(itemImageDir, "item"),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("image");