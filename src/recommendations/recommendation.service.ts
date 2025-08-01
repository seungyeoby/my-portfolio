import ItemConditionRepository from "../repositories/itemCondition.repository.js";
import { Answer } from "../types/answer.js";

export default class RecommendationService {
  private itemConditionRepo: ItemConditionRepository;
  constructor() {
    this.itemConditionRepo = new ItemConditionRepository();
  }

  async getRecommendedItemIds(answer: Answer) {
    const { travelStart, travelEnd, ...rest } = answer;

    // 계절 계산
    const SEASON_MAP: Record<string, number[]> = {
      winter: [12, 1, 2],
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall: [9, 10, 11],
    };

    const startDate = new Date(answer.travelStart);
    const endDate = new Date(answer.travelEnd);

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
    const options: string[] = [...seasons, "default"];
    Object.entries(rest).forEach(([key, value]) => {
      if (typeof value === "string") {
        options.push(value.toLowerCase());
      } else if (value === true) {
        options.push(key);
      }
    });
    console.log(
      "🚀 ~ RecommendationService ~ getRecommendedItemIds ~ options:",
      options
    );

    const recommendedItems = await this.itemConditionRepo.getRecommendedItemIds(
      options
    );

    const uniqueRecommendedItems = Array.from(
      new Map(
        recommendedItems.map(({ item }) => [
          item.itemId,
          { itemId: item.itemId, itemLabel: item.itemLabel },
        ])
      ).values()
    );

    return uniqueRecommendedItems;
  }
}
