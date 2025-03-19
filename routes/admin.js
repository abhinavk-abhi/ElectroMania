import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';
import adminAuth from '../middleware/authMiddleware.js'
import customerController from '../controller/admin/customerController.js'

router.get('/',adminAuth.isLogged,adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/dashboard',adminController.loadHome)
router.get('/customers',adminAuth.isLogged,customerController.userInfo)
router.get('/products',adminAuth.isLogged,adminController.loadProducts)
router.get('/categories',adminAuth.isLogged,adminController.loadCategories)
router.put('/customers',adminAuth.isLogged,customerController.userBlock)
router.get('/customers/filter',adminAuth.isLogged, customerController.filterCustomers);

export default router;