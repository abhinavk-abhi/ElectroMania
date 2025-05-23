import express from 'express';
const router = express.Router();
import adminController from '../controller/admin/adminController.js';
import adminAuth from '../middleware/authMiddleware.js'
import customerController from '../controller/admin/customerController.js'
import productController from '../controller/admin/productController.js';
import categoryController from '../controller/admin/categoryController.js';
import upload from '../middleware/imageUpload.js';
import adminOrder from '../controller/admin/adminOrders.js';
import couponController from '../controller/admin/couponController.js';
import salesController from '../controller/admin/salesController.js';

router.get('/',adminAuth.isLogin,adminController.loadLogin)
router.post('/login',adminController.login)
router.get('/logout',adminAuth.checkSession,adminController.logout)

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


//Orders
router.get('/orders',adminAuth.checkSession,adminOrder.loadOrder)
router.get('/orders/:orderId',adminAuth.checkSession,adminOrder.loadDetails)
router.put('/orders/status/:itemId',adminAuth.checkSession,adminOrder.updateStatus)
router.post('/orderReturn',adminAuth.checkSession,adminOrder.orderReturn)


//Coupon
router.get('/coupons',adminAuth.checkSession,couponController.loadCoupons)
router.post('/coupons',adminAuth.checkSession,couponController.addCoupon)
router.put('/coupons',adminAuth.checkSession,couponController.editCoupon)

// These routes will be available at:
router.get('/sales-report', adminAuth.checkSession, salesController.getSalesReport);           // /admin/sales-report
router.get('/sales-report/pdf', adminAuth.checkSession, salesController.exportToPDF);         // /admin/sales-report/pdf
router.get('/sales-report/excel', adminAuth.checkSession, salesController.exportToExcel);     // /admin/sales-report/excel

export default router;