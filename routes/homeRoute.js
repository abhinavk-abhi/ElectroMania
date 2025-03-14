import express from 'express';
const router = express.Router();
import homeController from '../controller/homeController.js';


router.get('/',homeController.loadHome);
router.get('/register', homeController.loadRegister);


export default router;
