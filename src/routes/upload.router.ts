// src/routes/upload.router.ts
import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.js";
import { uploadProfilePhoto, getProfilePhotoPath } from "../middlewares/upload.js";

const router = Router();

router.post(
  "/profile-photo",
  authenticateToken,            // 쿠키/토큰 인증
  uploadProfilePhoto,           // single("profilePhoto")
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "파일이 없습니다." });
    const url = getProfilePhotoPath(req.file.filename); // "/uploads/profiles/xxx.jpg"
    return res.status(200).json({ url });
  }
);

export default router;
