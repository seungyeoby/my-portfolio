export type Items = {
  categoryId: number;
  categoryLabel: string;
  items: Omit<Item, "clickCount">[];
};

export type Item = {
  itemId: number;
  itemLabel: string;
};
