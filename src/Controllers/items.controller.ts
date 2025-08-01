import ItemService from "../services/items.service.js";
import { Request, Response } from "express";

class ItemController {
  private itemService: ItemService;
  constructor() {
    this.itemService = new ItemService();
  }

  getWholeItems = async (req: Request, res: Response) => {
    const result = await this.itemService.getWholeItems();
    return res.status(200).send(result);
  };

  getItemsByClickCountDesc = async (req: Request, res: Response) => {
    const result = await this.itemService.getItemsByClickCountDesc();
    return res.status(200).send(result);
  };
}

export default new ItemController();
