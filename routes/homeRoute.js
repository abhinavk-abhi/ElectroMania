import express from 'express';
const router = express.Router();
import homeController from '../controller/user/userController.js';


router.get('/',homeController.loadHome);
router.get('/signup',homeController.loadRegister);

export default router;
