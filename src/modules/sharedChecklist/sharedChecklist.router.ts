import { Router } from 'express';
import sharedChecklistController from './sharedChecklist.controller.js';
import { authenticateToken } from '../../middlewares/auth.js';

const router = Router();

// 공개 목록(전체)
router.get('/', sharedChecklistController.getAllSharedChecklists);

// 공개 단건
router.get('/:checklistId', sharedChecklistController.getSharedChecklistById);

// 공유 ON/OFF
router.post('/:checklistId', authenticateToken, sharedChecklistController.shareChecklist);
router.patch('/:checklistId', authenticateToken, sharedChecklistController.unshareChecklist);

export default router;