import { TravelType } from "@prisma/client";

export type Answer = {
  travel_type: TravelType;
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
