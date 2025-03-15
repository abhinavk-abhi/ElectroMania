import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';

router.get('/',adminController.loadLogin)
router.get('/dashboard',adminController.loadHome)

export default router;