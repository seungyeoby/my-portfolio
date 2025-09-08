import { TravelType } from "@prisma/client";

export type Answer = {
  travelType: TravelType;
  transportation: "rentalCar" | "publicTransportation";
  withPet: boolean;
  withBaby: boolean;
  withElderly: boolean;
  visitJapan: boolean;
  travelStart: string;
  travelEnd: string;
};

export type RecommendedItems = {
  itemId: number;
  itemLabel: string;
}[];

// DB에서 뽑아 프론트로 돌려줄 "평탄화된 추천 아이템" 레코드
export interface RecommendedFlat {
  itemId: number;
  categoryLabel: string;        // ex) "의류", "전자기기"
  itemLabel: string;            // ex) "여권", "충전기"
}
