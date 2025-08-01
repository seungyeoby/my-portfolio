import express, { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import { 
  travelInfoValidation,
  createTravelTipValidation,
  updateTravelTipValidation,
  deleteTravelTipValidation,
  getTravelTipByIdValidation
} from "../middlewares/validation.js";

const router = express.Router();

// 여행 정보 조회 API (전체 리스트)
router.get("/travel-info", travelInfoValidation, async (req: Request, res: Response) => {
  try {
    console.log("여행 정보 조회 요청 받음:", req.query);
    
    const { category } = req.query;
    console.log("카테고리 필터:", category);

    // 여행 팁 조회 (실제 데이터베이스에서)
    let whereClause = {};
    if (category) {
      whereClause = { category: category as string };
    }
    
    const tips = await prisma.travelTip.findMany({
      where: whereClause,
      orderBy: [
        { id: 'asc' }
      ]
    });

    // BigInt를 Number로 변환하여 직렬화 가능하게 만들기
    const serializedTips = tips.map(tip => ({
      id: Number(tip.id),
      title: tip.title,
      content: tip.content,
      category: tip.category,
    }));

    console.log("여행 정보 조회 완료:", serializedTips.length, "개");

    res.json({
      success: true,
      tips: serializedTips,
    });
  } catch (error) {
    console.error("여행 정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 개별 여행정보 조회 API
router.get("/travel-info/:id", getTravelTipByIdValidation, async (req: Request, res: Response) => {
  try {
    console.log("개별 여행정보 조회 요청 받음:", req.params);
    
    const { id } = req.params;
    console.log("조회할 여행정보 ID:", id);

    // 특정 ID의 여행 팁 조회
    const tip = await prisma.travelTip.findUnique({
      where: { id: BigInt(id) },
    });

    if (!tip) {
      console.log("여행정보를 찾을 수 없음:", id);
      return res.status(404).json({
        success: false,
        message: "해당 여행정보를 찾을 수 없습니다",
      });
    }

    // BigInt를 Number로 변환하여 직렬화 가능하게 만들기
    const serializedTip = {
      id: Number(tip.id),
      title: tip.title,
      content: tip.content,
      category: tip.category,
    };

    console.log("개별 여행정보 조회 완료:", serializedTip.title);

    res.json({
      success: true,
      tip: serializedTip,
    });
  } catch (error) {
    console.error("개별 여행정보 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 여행 정보 생성 API
router.post("/travel-info", createTravelTipValidation, async (req: Request, res: Response) => {
  try {
    console.log("여행 정보 생성 요청 받음:", req.body);
    
    const { title, content, category } = req.body;
    console.log("파싱된 데이터:", { title, content, category });

    // 여행 팁 생성
    const newTip = await prisma.travelTip.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        category,
      },
    });

    console.log("여행 정보 생성 완료:", newTip.title);

    res.status(201).json({
      success: true,
      message: "여행 정보가 성공적으로 생성되었습니다",
      tip: {
        id: Number(newTip.id),
        title: newTip.title,
        content: newTip.content,
        category: newTip.category,
      },
    });
  } catch (error) {
    console.error("여행 정보 생성 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 여행 정보 수정 API
router.patch("/travel-info/:id", updateTravelTipValidation, async (req: Request, res: Response) => {
  try {
    console.log("여행 정보 수정 요청 받음:", { id: req.params.id, body: req.body });
    
    const { id } = req.params;
    const { title, content, category } = req.body;
    console.log("파싱된 데이터:", { id, title, content, category });

    // 여행 팁 존재 확인
    const existingTip = await prisma.travelTip.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingTip) {
      console.log("여행정보를 찾을 수 없음:", id);
      return res.status(404).json({
        success: false,
        message: "해당 여행정보를 찾을 수 없습니다",
      });
    }

    // 수정할 데이터 준비
    const updateData: any = {};
    if (title !== undefined) {
      updateData.title = title.trim();
    }
    if (content !== undefined) {
      updateData.content = content.trim();
    }
    if (category !== undefined) {
      updateData.category = category;
    }

    // 수정할 데이터가 없는 경우
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "수정할 데이터가 없습니다",
      });
    }

    // 여행 팁 수정
    const updatedTip = await prisma.travelTip.update({
      where: { id: BigInt(id) },
      data: updateData,
    });

    console.log("여행 정보 수정 완료:", updatedTip.title);

    res.json({
      success: true,
      message: "여행 정보가 성공적으로 수정되었습니다",
      tip: {
        id: Number(updatedTip.id),
        title: updatedTip.title,
        content: updatedTip.content,
        category: updatedTip.category,
      },
    });
  } catch (error) {
    console.error("여행 정보 수정 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 여행 정보 삭제 API
router.delete("/travel-info/:id", deleteTravelTipValidation, async (req: Request, res: Response) => {
  try {
    console.log("여행 정보 삭제 요청 받음:", req.params);
    
    const { id } = req.params;
    console.log("삭제할 여행정보 ID:", id);

    // 여행 팁 존재 확인
    const existingTip = await prisma.travelTip.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingTip) {
      console.log("여행정보를 찾을 수 없음:", id);
      return res.status(404).json({
        success: false,
        message: "해당 여행정보를 찾을 수 없습니다",
      });
    }

    // 여행 팁 삭제
    await prisma.travelTip.delete({
      where: { id: BigInt(id) },
    });

    console.log("여행 정보 삭제 완료:", existingTip.title);

    res.json({
      success: true,
      message: "여행 정보가 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("여행 정보 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router; 