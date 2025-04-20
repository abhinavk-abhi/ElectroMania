import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';
import adminAuth from '../middleware/authMiddleware.js'
import customerController from '../controller/admin/customerController.js'
import productController from '../controller/admin/productController.js';
import categoryController from '../controller/admin/categoryController.js';
import upload from '../middleware/imageUpload.js';

router.get('/',adminAuth.isLogin,adminController.loadLogin)
router.post('/login',adminController.login)


router.get('/dashboard',adminAuth.checkSession,adminController.loadHome)

//Products
router.get('/products',adminAuth.checkSession,productController.productLoad)
router.get('/newProducts',adminAuth.checkSession,productController.loadAddProduct)
router.post('/addProducts',adminAuth.checkSession,upload.any(),productController.addProduct)
router.get('/updateProducts/:productId',adminAuth.checkSession,productController.loadEditProducts)
router.put('/products/:productId',adminAuth.checkSession,upload.any(),productController.editProduct)

//Category
router.get('/categories',adminAuth.checkSession, categoryController.categoryInfo);
router.post('/categories',adminAuth.checkSession,categoryController.addCategory);
router.put('/categories',adminAuth.checkSession,categoryController.editCategory);
router.get('/categories/filter',adminAuth.checkSession,categoryController.filterCategories);

//Customers
router.get('/customers',adminAuth.checkSession,customerController.userInfo)
router.put('/customers',adminAuth.checkSession,customerController.userBlock)
router.get('/customers/filter',adminAuth.checkSession, customerController.filterCustomers);

export default router;