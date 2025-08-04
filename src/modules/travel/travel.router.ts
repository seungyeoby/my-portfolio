import express from "express";
import { 
  travelInfoValidation,
  createTravelTipValidation,
  updateTravelTipValidation,
  deleteTravelTipValidation,
  getTravelTipByIdValidation
} from "../../middlewares/validation.js";
import { TravelController } from "./travel.controller.js";

const router = express.Router();
const travelController = new TravelController();

// 여행 정보 조회 API (전체 리스트)
router.get("/travel-info", travelInfoValidation, travelController.getAllTravelInfo);

// 개별 여행정보 조회 API
router.get("/travel-info/:id", getTravelTipByIdValidation, travelController.getTravelInfoById);

// 여행 정보 생성 API
router.post("/travel-info", createTravelTipValidation, travelController.createTravelInfo);

// 여행 정보 수정 API
router.patch("/travel-info/:id", updateTravelTipValidation, travelController.updateTravelInfo);

// 여행 정보 삭제 API
router.delete("/travel-info/:id", deleteTravelTipValidation, travelController.deleteTravelInfo);

export default router; 