import checklistRepository from "../Repositories/checklist.repository.js";
import { Checklist } from "../types/checklist.js";

class userService {
  async createChecklist(checklist: Checklist) {
    const { items, ...checklistInfo } = checklist;
    await checklistRepository.saveChecklist(items, checklistInfo);
  }

  async deleteChecklist(checklistId: number) {
    await checklistRepository.deleteChecklist(checklistId);
  }
}

export default new userService();
