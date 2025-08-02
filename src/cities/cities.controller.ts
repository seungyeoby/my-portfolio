import CitiesService from "./cities.service.js";
import { Request, Response } from "express";

class CitiesController {
  private citiesService: CitiesService;

  constructor() {
    this.citiesService = new CitiesService();
  }

  getWholeCities = async (req: Request, res: Response) => {
    const cities = await this.citiesService.getCities();
    return res.status(200).send(cities);
  };
}

export default new CitiesController();
