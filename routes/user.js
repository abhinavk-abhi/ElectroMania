import express from 'express';
const router = express.Router();
import userController from '../controller/user/userController.js'


router.post('/register',userController.registerUser)
router.get('/login',userController.loadLogin)


export default router;                  