import type ItemsRepository from "../Repositories/items.repository.js";
import type ItemCategoryRepository from "../Repositories/itemCategory.repository.js";
import { Item, Items } from "../types/Items.js";

export default class ItemService {
  constructor(
    private itemRepo: ItemsRepository,
    private itemCategoryRepo: ItemCategoryRepository
  ) {}

  async getWholeItems() {
    const wholeItems = await this.itemCategoryRepo.getItems();
    const res = wholeItems.sort(
      (a: Items, b: Items) => a.categoryId - b.categoryId
    );
    return res;
  }

  async getItemsByClickCountDesc() {
    const items: Item[] = await this.itemRepo.getItemsByClickCountDesc();
    const res = items.map(({ itemLabel, clickCount }) => ({
      itemLabel,
      clickCount,
    }));

    return res;
  }
}
