import { Router } from 'express';
import sharedChecklistController from './sharedChecklist.controller.js';
import { authenticateToken } from "../../middlewares/auth.js";
const router = Router();

// 공유된 체크리스트 전체 조회
router.get('/', sharedChecklistController.getAllSharedChecklists);

// 공유된 체크리스트 개별 조회
router.get('/:checklistId', sharedChecklistController.getSharedChecklistById);

// 체크리스트 공유
router.post('/:checklistId/', authenticateToken, sharedChecklistController.shareChecklist);

// 공유 해제
router.patch('/:checklistId', authenticateToken, sharedChecklistController.unshareChecklist);

export default router;
