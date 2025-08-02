import prisma from "../lib/prisma.js";

export default class CitiesRepository {
  async getCities() {
    try {
      return await prisma.city.findMany();
    } catch (e) {
      throw new Error("DataBaseError");
    }
  }
}
