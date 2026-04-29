import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getDeals,
  createDeal,
  updateDeal,
  deleteDeal,
} from '../controllers/dealController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getDeals).post(createDeal);
router.route('/:id').put(updateDeal).delete(deleteDeal);

export default router;
