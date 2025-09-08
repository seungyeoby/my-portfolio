import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// ── 절대 경로 고정(ESM 안전)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// <server-root> 기준으로 uploads 폴더 고정
const ROOT_DIR = path.resolve(__dirname, "..", ".."); // 서버 루트 추정
const UPLOAD_ROOT = path.join(ROOT_DIR, "uploads");
const PROFILE_DIR = path.join(UPLOAD_ROOT, "profiles");
const ITEM_IMAGE_DIR = path.join(UPLOAD_ROOT, "item-images"); // 하이픈 유지

// ── 폴더 보장
fs.mkdirSync(PROFILE_DIR, { recursive: true });
fs.mkdirSync(ITEM_IMAGE_DIR, { recursive: true });

// ── 공통 파일 필터
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error("지원하지 않는 파일 형식입니다. JPG/PNG/GIF만 업로드 가능합니다."));
};

// ── 프로필 업로드(storage)
const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PROFILE_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${uniqueSuffix}${ext}`); // ← 백틱 사용
  },
});

const profileUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProfilePhoto = profileUpload.single("profilePhoto");

// ── 프로필 파일 삭제/경로 유틸
export const deleteFile = (filename: string) => {
  const filePath = path.join(PROFILE_DIR, filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

export const getProfilePhotoPath = (filename?: string | null) =>
  filename ? `/uploads/profiles/${filename}` : null;

export const getDefaultProfilePhoto = () => "/images/default-profile.svg";

// ── 아이템 이미지 업로드(storage)
const itemImageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, ITEM_IMAGE_DIR),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `item_${uniqueSuffix}${ext}`); // ← 백틱 사용
  },
});

const itemImageUpload = multer({
  storage: itemImageStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadItemImage = itemImageUpload.single("image"); // ← 필드명 "image"

export const getItemImagePath = (filename?: string | null) =>
  filename ? `/uploads/item-images/${filename}` : null;



