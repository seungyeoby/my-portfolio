import multer from "multer";
import path from "path";
import { Request } from "express";

const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: any,
    cb: (arg0: null, arg1: string) => void
  ) => {
    cb(null, "public/images");
  },
  filename: (
    req: Request,
    file: { originalname: string },
    cb: (arg0: null, arg1: string) => void
  ) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });
export default upload;
