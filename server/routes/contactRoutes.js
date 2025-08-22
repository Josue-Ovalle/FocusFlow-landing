import express from 'express';
import { createContact, getContacts } from '../controllers/contactController.js';
import { validateContact } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateContact, createContact);
router.get('/', getContacts); // Ruta protegida debería agregarse en producción

export default router;