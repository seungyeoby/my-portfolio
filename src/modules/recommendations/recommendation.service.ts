import ItemConditionRepository from "../../repositories/itemCondition.repository.js";
import { Answer, RecommendedFlat } from "../../types/answer.js";

export default class RecommendationService {
  private itemConditionRepo: ItemConditionRepository;

  constructor() {
    this.itemConditionRepo = new ItemConditionRepository();
  }

  async getRecommendedItemIds(answer: Answer): Promise<RecommendedFlat[]> {
    const { travelStart, travelEnd, ...rest } = answer;

    /** 1) 기간 → 계절 세트 */
    const SEASON_MAP: Record<string, number[]> = {
      winter: [12, 1, 2],
      spring: [3, 4, 5],
      summer: [6, 7, 8],
      fall:   [9, 10, 11],
    };

    const startDate = new Date(travelStart);
    const endDate   = new Date(travelEnd);
    const months = new Set<number>();
    const cur = new Date(startDate);
    cur.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    while (cur <= endDate) {
      months.add(cur.getMonth() + 1);
      cur.setMonth(cur.getMonth() + 1);
    }

    const seasons = new Set<string>();
    months.forEach((m) => {
      for (const [season, arr] of Object.entries(SEASON_MAP)) {
        if (arr.includes(m)) { seasons.add(season); break; }
      }
    });

    /** 2) 한글 → 기본 키 매핑 (우선 표준화) */
    const PURPOSE_MAP: Record<string, string> = {
      "힐링": "healing",
      "액티비티": "activity",
      "비즈니스": "business",
      "문화탐방": "exploration",  // culture 대신 exploration을 쓰는 DB가 있으므로 여기에 맞춰 표준화
      "캠핑": "camping",
    };
    const TRANSPORT_MAP: Record<string, string> = {
      "렌트": "rent",
      "대중교통": "public",
    };
    const ACTIVITY_MAP: Record<string, string> = {
      "등산": "hiking",
      "바다 수영": "swim",
      "맛집 탐방": "food",
      "유적지 탐방": "heritage",
    };
    const COMPANION_MAP: Record<string, string> = {
      "유아": "baby",     // infant → DB는 baby일 수 있으므로 표준을 baby로
      "미성년자": "teen",
      "노인": "elderly",
      "반려 동물": "pet",
    };

    const toLower = (s: string) => s.trim().toLowerCase();

    /** 3) 들어올 수 있는 키 이름 모두 허용 (타입 경고 없이 안전) */
    const r = rest as Record<string, any>;
    const rawPurpose    = r.purpose ?? r.travelType ?? "";
    const rawTransport  = r.transport ?? r.transportation ?? "";
    const rawActivities = Array.isArray(r.activities) ? r.activities : [];
    const rawCompanions = Array.isArray(r.companions) ? r.companions : [];
    const minimalPack   = r.minimalPack === true || r.minimal === true;
    const exchange      = r.exchange === true;

    /** 4) 1차 옵션 세트(표준 키) */
    const optionSet = new Set<string>(["default", ...Array.from(seasons)]);

    if (typeof rawPurpose === "string" && rawPurpose.trim()) {
      optionSet.add(toLower(PURPOSE_MAP[rawPurpose] ?? rawPurpose));
    }
    if (typeof rawTransport === "string" && rawTransport.trim()) {
      optionSet.add(toLower(TRANSPORT_MAP[rawTransport] ?? rawTransport));
    }

    rawActivities.forEach((a: any) => {
      if (typeof a === "string" && a.trim()) {
        optionSet.add(toLower(ACTIVITY_MAP[a] ?? a));
      }
    });
    rawCompanions.forEach((c: any) => {
      if (typeof c === "string" && c.trim()) {
        optionSet.add(toLower(COMPANION_MAP[c] ?? c));
      }
    });

    if (minimalPack) optionSet.add("minimalpack");
    if (exchange)    optionSet.add("exchange");

    /** 5) DB에 들어있는 값과의 동의어 확장 */
    const SYN: Record<string, string[]> = {
      // 목적/활동
      business: ['business','비즈니스'],
      activity: ['activity','액티비티','recreation'],  // DB: recreation
      exploration: ['exploration','문화탐방','culture'],
      // 교통
      rent: ['rent','렌트','rentalCar'],                         // DB: rentalCar
      public: ['public','대중교통','publicTransportation'],      // DB: publicTransportation
      // 동행
      pet: ['pet','반려 동물'],
      baby: ['baby','유아','infant'],
      elderly: ['elderly','노인','senior'],
      teen: ['teen','미성년자'],
      // 계절
      winter: ['winter','겨울'],
      spring: ['spring','봄'],
      summer: ['summer','여름'],
      fall:   ['fall','autumn','가을'],
      // 기타
      minimalpack: ['minimalpack','미니멀','minimal'],
      exchange: ['exchange','환전'],
      visitjapan: ['visitjapan','visitJapan','비짓재팬'],
      nonranking: ['nonranking','nonRanking'],
      '90daysormore': ['90daysormore','90DaysOrMore'],
      default: ['default'],
    };

    // 동의어 확장 (표준키 → DB에 들어있는 다양한 표현들)
    const expanded = new Set<string>();
    for (const o of optionSet) {
      const k = toLower(String(o));
      (SYN[k] ?? [k]).forEach((v) => expanded.add(v));
    }
    const options = Array.from(expanded);
    // 디버깅 필요시:
    // console.log("[recommend] options ->", options);

    /** 6) DB 조회 */
    const rows = await this.itemConditionRepo.getRecommendedItemIds(options);

    /** 7) 중복 제거 + 평탄화 */
    const unique = Array.from(
      new Map(
        rows.map(({ item }: any) => [
          item.itemId,
          {
            itemId: item.itemId,
            categoryLabel: item.itemCategory.categoryLabel,
            itemLabel: item.itemLabel,
          } as RecommendedFlat,
        ])
      ).values()
    );

    return unique;
  }
}