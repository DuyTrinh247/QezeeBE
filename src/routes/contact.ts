import { Router } from 'express';
import * as contactController from '../controllers/contactController';

const router = Router();

/**
 * @route POST /api/v1/contact/send
 * @desc Send contact form email
 * @access Public
 */
router.post('/send', contactController.sendContactEmail);

export default router;
