import { Request, Response, NextFunction } from 'express';
import SharedChecklistService from './sharedChecklist.service.js';

class SharedChecklistController {
  private service = new SharedChecklistService();

  getAllSharedChecklists = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sort = 'likes' } = req.query as { sort?: string };
      const result = await this.service.getAllSharedChecklists(sort);
      return res.status(200).json(result);
    } catch (error) {
      next(new Error("ShareChecklistError"));
    }
  };

  getSharedChecklistById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { checklistId } = req.params;
      const result = await this.service.getSharedChecklistById(Number(checklistId));
      return res.status(200).json(result);
    } catch (error) {
      next(new Error("ChecklistNotFound"));
    }
  };

  shareChecklist = async (req: Request, res: Response, next: NextFunction) => {
  const checklistId = Number(req.params.checklistId);

  if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  try {
    await this.service.shareChecklist(checklistId, req.user);
    return res.status(200).json({ message: '체크리스트가 공유되었습니다.' });
  } catch (error) {
    next(new Error("FailShared"));
  }
}

  unshareChecklist = async (req: Request, res: Response, next: NextFunction) => {
  const checklistId = Number(req.params.checklistId);

  if (!req.user) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

    try {
      await this.service.unshareChecklist(checklistId, req.user);
      return res.status(200).json({ message: '체크리스트 공유가 해제되었습니다.' });
    } catch (error) {
      next(new Error("FailUnshared"));
    }
  };
}

export default new SharedChecklistController();
