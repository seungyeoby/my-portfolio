import { Request, Response } from "express";
import { TravelService } from "./travel.service.js";
import { asyncHandler } from "../../middlewares/errorHandler.js";

export class TravelController {
  private travelService: TravelService;

  constructor() {
    this.travelService = new TravelService();
  }

  // 전체 여행정보 조회
  getAllTravelInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("여행 정보 조회 요청 받음:", req.query);
    
    const { category } = req.query;
    console.log("카테고리 필터:", category);

    const tips = await this.travelService.getAllTravelInfo(category as string);

    console.log("여행 정보 조회 완료:", tips.length, "개");

    res.json({
      success: true,
      tips: tips,
    });
  });

  // 개별 여행정보 조회
  getTravelInfoById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("개별 여행정보 조회 요청 받음:", req.params);
    
    const { id } = req.params;
    console.log("조회할 여행정보 ID:", id);

    const tip = await this.travelService.getTravelInfoById(Number(id));

    if (!tip) {
      console.log("여행정보를 찾을 수 없음:", id);
      res.status(404).json({
        success: false,
        message: "해당 여행정보를 찾을 수 없습니다",
      });
      return;
    }

    console.log("개별 여행정보 조회 완료:", tip.title);

    res.json({
      success: true,
      tip: tip,
    });
  });

  // 여행정보 생성
  createTravelInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("여행 정보 생성 요청 받음:", req.body);
    
    const { title, content, category } = req.body;
    console.log("파싱된 데이터:", { title, content, category });

    const newTip = await this.travelService.createTravelInfo({
      title,
      content,
      category,
    });

    console.log("여행 정보 생성 완료:", newTip.title);

    res.status(201).json({
      success: true,
      message: "여행 정보가 성공적으로 생성되었습니다",
      tip: newTip,
    });
  });

  // 여행정보 수정
  updateTravelInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("여행 정보 수정 요청 받음:", { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const { title, content, category } = req.body;
    console.log("파싱된 데이터:", { id, title, content, category });

    const updatedTip = await this.travelService.updateTravelInfo(Number(id), {
      title,
      content,
      category,
    });

    console.log("여행 정보 수정 완료:", updatedTip.title);

    res.json({
      success: true,
      message: "여행 정보가 성공적으로 수정되었습니다",
      tip: updatedTip,
    });
  });

  // 여행정보 삭제
  deleteTravelInfo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    console.log("여행 정보 삭제 요청 받음:", req.params);
    
    const { id } = req.params;
    console.log("삭제할 여행정보 ID:", id);

    await this.travelService.deleteTravelInfo(Number(id));

    console.log("여행 정보 삭제 완료");

    res.json({
      success: true,
      message: "여행 정보가 성공적으로 삭제되었습니다",
    });
  });
} 