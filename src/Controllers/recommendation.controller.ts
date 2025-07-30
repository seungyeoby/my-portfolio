import recommendationService from "../Services/recommendation.service.js";
import { Answer } from "../types/answer.js";
import { Request, Response } from "express";

class RecommendationController {
  async getRecommendedItems(req: Request, res: Response) {
    const answer: Answer = req.body;
    const recommendedItems = await recommendationService.getRecommendedItemIds(
      answer
    );
    return res.status(200).send(recommendedItems);
  }
}

export default new RecommendationController();
