import RecommendationService from "./recommendation.service.js";
import { Request, Response } from "express";

class RecommendationController {
  private recommendationService = new RecommendationService();

  getRecommendedItems = async (req: Request, res: Response) => {
    try {
      const recommended = await this.recommendationService.getRecommendedItemIds(req.body);
      return res.status(200).json(recommended);
    } catch (e: any) {
      console.error("[recommend] error:", e);
      return res.status(500).json({ message: e?.message ?? "Internal Server Error" });
    }
  };
}

export default new RecommendationController();
