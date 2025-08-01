import { TravelType, PackingBag } from "@prisma/client";

export type Checklist = {
  userId: number;
  title: string;
  cityId: number;
  travelType: TravelType;
  travelStart: string;
  travelEnd: string;
  items: Item[];
};

export type Item = {
  itemId: number;
  packingBag: PackingBag;
};

export type ChangedChecklistItems = {
  addedItems: {
    itemId: number;
    packingBag: PackingBag;
  }[];
  removedItems: number[];
  packingBagChangedItems: number[];
};

export type ChecklistDTO = Omit<
  Checklist,
  "items" | "travelStart" | "travelEnd"
> & {
  travelStart: Date;
  travelEnd: Date;
};
