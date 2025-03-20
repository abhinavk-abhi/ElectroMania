import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';
import adminAuth from '../middleware/authMiddleware.js'
import customerController from '../controller/admin/customerController.js'
import productController from '../controller/admin/productController.js';
import categoryController from '../controller/admin/categoryController.js';

router.get('/admin/login',adminAuth.isLogin,adminController.loadLogin)
router.post('/login',adminController.login)


router.get('/dashboard',adminAuth.isLogin,adminController.loadHome)

//Products
router.get('/products',adminAuth.isLogin,productController.productLoad)
router.get('/newProducts',adminAuth.isLogin,productController.addProduct)

//Category
router.get('/categories',adminAuth.checkSession, categoryController.categoryInfo);
router.post('/categories',categoryController.addCategory);
router.put('/categories',categoryController.editCategory);
router.get('/categories/filter', adminAuth.checkSession, categoryController.filterCategories);

//Customers
router.get('/customers',adminAuth.isLogin,customerController.userInfo)
router.put('/customers',customerController.userBlock)
router.get('/customers/filter',adminAuth.checkSession, customerController.filterCustomers);

export default router;