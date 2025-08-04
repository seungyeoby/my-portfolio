import CitiesRepository from "../../repositories/cities.repository.js";

export default class CitiesService {
  private citiesRepo: CitiesRepository;

  constructor() {
    this.citiesRepo = new CitiesRepository();
  }

  async getCities() {
    const cities = await this.citiesRepo.getCities();
    return cities;
  }
}
