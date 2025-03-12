import express from 'express';
const router = express.Router();
import userController from '../controller/user/userController.js'


router.post('/register',userController.registerUser)
router.get('/login',userController.loadLogin)
router.get('/signUpOtp',userController.otpLoader)

export default router;                  