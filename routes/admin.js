import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';
import adminAuth from '../middleware/authMiddleware.js'

router.get('/',adminAuth.isLogged,adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/dashboard',adminController.loadHome)
router.get('/customers',adminAuth.isLogged,adminController.loadCustomer)

export default router;