import type RecommendationService from "../Services/recommendation.service.js";
import { Answer } from "../types/answer.js";
import { Request, Response } from "express";

export default class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  getRecommendedItems = async (req: Request, res: Response) => {
    const answer: Answer = req.body;
    const recommendedItems =
      await this.recommendationService.getRecommendedItemIds(answer);
    return res.status(200).send(recommendedItems);
  };
}
