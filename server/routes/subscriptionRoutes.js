import express from 'express';
import { createSubscription, cancelSubscription } from '../controllers/subscriptionController.js';
import { validateSubscription } from '../middleware/validation.js';

const router = express.Router();

router.post('/', validateSubscription, createSubscription);
router.delete('/:email', cancelSubscription);

export default router;