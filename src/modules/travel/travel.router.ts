import express, { Request, Response } from "express";
import { 
  travelInfoValidation,
  createTravelTipValidation,
  updateTravelTipValidation,
  deleteTravelTipValidation,
  getTravelTipByIdValidation
} from "../../middlewares/validation.js";

const router = express.Router();

// 여행 정보 조회 API (전체 리스트)
router.get("/travel-info", travelInfoValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "여행 정보 조회 기능은 구현 예정입니다" });
});

// 개별 여행정보 조회 API
router.get("/travel-info/:id", getTravelTipByIdValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "개별 여행정보 조회 기능은 구현 예정입니다" });
});

// 여행 정보 생성 API
router.post("/travel-info", createTravelTipValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "여행 정보 생성 기능은 구현 예정입니다" });
});

// 여행 정보 수정 API
router.patch("/travel-info/:id", updateTravelTipValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "여행 정보 수정 기능은 구현 예정입니다" });
});

// 여행 정보 삭제 API
router.delete("/travel-info/:id", deleteTravelTipValidation, (req: Request, res: Response) => {
  res.status(501).json({ message: "여행 정보 삭제 기능은 구현 예정입니다" });
});

export default router; 