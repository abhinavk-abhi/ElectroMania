import express from 'express';
const router = express.Router();
import homeController from '../controller/homeController.js';
import userAuth from '../middleware/userAuth.js'


router.get('/',homeController.loadHome);
router.get('/register',homeController.loadRegister);
router.get('/shop',homeController.loadShop)
router.get('/productDetails/:productId',homeController.loadProductDetails)


export default router;
