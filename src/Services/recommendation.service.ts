import recommendationRepository from "../Repositories/recommendation.repository.js";
import { Answer } from "../types/answer.js";

class RecommendationService {
  async getRecommendedItemIds(answer: Answer) {
    // 계절 계산
    const SEASON_MAP: Record<string, number[]> = {
      winter: [12, 1, 2],
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall: [9, 10, 11],
    };

    const startDate = new Date(answer.travel_start);
    const endDate = new Date(answer.travel_end);

    const monthsSet = new Set<number>();
    let current: Date = new Date(startDate);

    while (current <= endDate) {
      monthsSet.add(current.getMonth() + 1);
      current.setMonth(current.getMonth() + 1);
    }

    // 계절 추출
    const seasons = new Set<string>();
    monthsSet.forEach((month) => {
      for (const [season, months] of Object.entries(SEASON_MAP)) {
        if (months.includes(month)) {
          seasons.add(season);
          break;
        }
      }
    });

    // 옵션들 전부 가져오기
    const options: string[] = [...seasons];
    for (const k of Object.keys(answer) as (keyof Answer)[]) {
      switch (typeof answer[k]) {
        case "string":
          options.push(answer[k].toLowerCase());
          break;
        case "boolean":
          if (answer[k]) options.push(k);
      }
    }

    const recommendedItemIds =
      await recommendationRepository.getRecommendedItemIds(options);

    const uniqueItemMap = new Map();
    for (const { item } of recommendedItemIds) {
      if (!uniqueItemMap.has(item.itemId)) {
        const { categoryId, ...rest } = item;
        uniqueItemMap.set(item.itemId, rest);
      }
    }

    const recommendedItems = Array.from(uniqueItemMap.values());

    return recommendedItems;
  }
}

export default new RecommendationService();
