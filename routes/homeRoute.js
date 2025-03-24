import express from 'express';
const router = express.Router();
import homeController from '../controller/homeController.js';
import userAuth from '../middleware/userAuth.js'


router.get('/',homeController.loadHome);
router.get('/register', userAuth.isLogin,homeController.loadRegister);


export default router;
