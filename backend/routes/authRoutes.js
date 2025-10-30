// authRoutes.js
import express from 'express';
import { login } from '../controllers/authController.js';

const router = express.Router();
router.post('/login', login);

export default router;

// userRoutes.js
import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

// fleetRoutes.js
import express from 'express';
import { getForklifts, createForklift, updateForklift, deleteForklift } from '../controllers/fleetController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getForklifts);
router.post('/', requireAdmin, createForklift);
router.put('/:id', requireAdmin, updateForklift);
router.delete('/:id', requireAdmin, deleteForklift);

export default router;

// checklistRoutes.js
import express from 'express';
import { getChecklists, createChecklist } from '../controllers/checklistController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken);

router.get('/', getChecklists);
router.post('/', createChecklist);

export default router;

// reportRoutes.js
import express from 'express';
import { getDashboardData, getUsageReport, getNCReport } from '../controllers/reportController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', getDashboardData);
router.get('/usage', getUsageReport);
router.get('/non-conformities', getNCReport);

export default router;
