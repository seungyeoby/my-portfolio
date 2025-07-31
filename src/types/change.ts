import { PackingBag } from "@prisma/client";

export type Change = {
  addedItems: {
    itemId: number;
    packingBag: PackingBag;
  }[];
  removedItems: number[];
  packingBagChangedItems: number[];
};
