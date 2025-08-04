import ItemsRepository from "../../repositories/items.repository.js";
import ItemCategoryRepository from "../../repositories/itemCategory.repository.js";
import { Item, Items } from "../../types/Items.js";

export default class ItemService {
  private itemRepo: ItemsRepository;
  private itemCategoryRepo: ItemCategoryRepository;

  constructor() {
    this.itemRepo = new ItemsRepository();
    this.itemCategoryRepo = new ItemCategoryRepository();
  }

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
