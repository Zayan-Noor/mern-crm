import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
  addNote,
} from '../controllers/contactController.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getContacts).post(createContact);
router.post('/:id/notes', addNote);
router.route('/:id').get(getContactById).put(updateContact).delete(deleteContact);

export default router;
