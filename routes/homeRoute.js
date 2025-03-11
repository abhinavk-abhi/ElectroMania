import express from 'express';
const router = express.Router();
import homeController from '../controller/user/userController.js';


router.get('/',homeController.loadHome);

export default router;
