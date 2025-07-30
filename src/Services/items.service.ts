import ItemsRepository from "../Repositories/items.repository.js";
import { Item, Items } from "../types/Items.js";

class ItemService {
  async getWholeItems() {
    const wholeItems = await ItemsRepository.getItems();
    const res = wholeItems.sort(
      (a: Items, b: Items) => a.categoryId - b.categoryId
    );
    return res;
  }

  async getItemsByClickCountDesc() {
    const items: Item[] = await ItemsRepository.getItemsByClickCountDesc();
    const res = items.map(({ itemLabel, clickCount }) => ({
      itemLabel,
      clickCount,
    }));

    return res;
  }
}

export default new ItemService();
