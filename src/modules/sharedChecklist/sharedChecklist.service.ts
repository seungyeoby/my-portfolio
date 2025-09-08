import ChecklistRepository from '../../repositories/checklist.repository.js';

export default class SharedChecklistService {
  private repo = new ChecklistRepository();

  async getAllSharedChecklists(sort: string) {
    try {
      return await this.repo.getAllSharedChecklists(sort);
    } catch {
      throw new Error('DataBaseError');
    }
  }

  async getSharedChecklistById(checklistId: number) {
    try {
      const checklist = await this.repo.getSharedChecklistById(checklistId);
      if (!checklist) throw new Error('ChecklistNotFound');
      return checklist;
    } catch (error: any) {
      if (error?.message === 'ChecklistNotFound') throw error;
      throw new Error('DataBaseError');
    }
  }

  async shareChecklist(checklistId: number, user: { userId: number; authority: string }) {
    try {
      const checklist = await this.repo.findChecklistByChecklistId(checklistId);
      if (!checklist) throw new Error('ChecklistNotFound');
      if (checklist.deletedAt) throw new Error('DeleteChecklistError');
      if (checklist.isShared) throw new Error('AlreadyShared');

      const isOwner = checklist.userId === user.userId;
      const isAdmin = user.authority === 'ADMIN';
      if (!isOwner && !isAdmin) throw new Error('AuthenticationError');

      return await this.repo.shareChecklist(checklistId);
    } catch (error: any) {
      const pass = ['ChecklistNotFound','DeleteChecklistError','AlreadyShared','AuthenticationError'];
      if (pass.includes(error?.message)) throw error;
      throw new Error('DataBaseError');
    }
  }

  async unshareChecklist(checklistId: number, user: { userId: number; authority: string }) {
    try {
      const checklist = await this.repo.findChecklistByChecklistId(checklistId);
      if (!checklist) throw new Error('ChecklistNotFound');
      if (checklist.deletedAt) throw new Error('DeleteChecklistError');
      if (!checklist.isShared) throw new Error('AlreadyUnshared');

      const isOwner = checklist.userId === user.userId;
      const isAdmin = user.authority === 'ADMIN';
      if (!isOwner && !isAdmin) throw new Error('AuthenticationError');

      return await this.repo.unshareChecklist(checklistId);
    } catch (error: any) {
      const pass = ['ChecklistNotFound','DeleteChecklistError','AlreadyShared','AlreadyUnshared','AuthenticationError'];
      if (pass.includes(error?.message)) throw error;
      throw new Error('DataBaseError');
    }
  }

  async getMine(userId: number) {
    try {
      return await this.repo.getSharedChecklistsByUserId(userId);
    } catch {
      throw new Error('DataBaseError');
    }
  }
}
