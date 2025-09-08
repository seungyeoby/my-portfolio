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
      next(error);
    }
  };

  getSharedChecklistById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { checklistId } = req.params;
      const result = await this.service.getSharedChecklistById(Number(checklistId));
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  shareChecklist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: '로그인이 필요합니다.' });
      const checklistId = Number(req.params.checklistId);
      await this.service.shareChecklist(checklistId, req.user);
      return res.status(200).json({ message: '체크리스트가 공유되었습니다.' });
    } catch (error) {
      next(error);
    }
  };

  unshareChecklist = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: '로그인이 필요합니다.' });
      const checklistId = Number(req.params.checklistId);
      await this.service.unshareChecklist(checklistId, req.user);
      return res.status(200).json({ message: '체크리스트 공유가 해제되었습니다.' });
    } catch (error) {
      next(error);
    }
  };

  /** 내가 공유한 목록 */
  getMine = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) return res.status(401).json({ message: '로그인이 필요합니다.' });
      const rows = await this.service.getMine(req.user.userId);
      return res.status(200).json(rows);
    } catch (error) {
      next(error);
    }
  };
}

export default new SharedChecklistController();
