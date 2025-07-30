import { TravelType } from "@prisma/client";

export type Answer = {
  travel_type: TravelType;
  transportation: "rental_car" | "public_transportation";
  with_pet: boolean;
  with_baby: boolean;
  with_elderly: boolean;
  visit_japan: boolean;
  travel_start: string;
  travel_end: string;
};
