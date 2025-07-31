import type ItemService from "../Services/items.service.js";
import { Request, Response } from "express";

export default class ItemController {
  constructor(private itemService: ItemService) {}

  getWholeItems = async (req: Request, res: Response) => {
    const result = await this.itemService.getWholeItems();
    return res.status(200).send(result);
  };

  getItemsByClickCountDesc = async (req: Request, res: Response) => {
    const result = await this.itemService.getItemsByClickCountDesc();
    return res.status(200).send(result);
  };
}
