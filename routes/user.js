import express from 'express';
const router = express.Router();
import userController from '../controller/user/userController.js'

router.get('/login',userController.loadLogin)
router.post('/login',userController.login)
router.post('/register',userController.registerUser)
router.get('/login',userController.loadLogin)
router.get('/signUpOtp',userController.otpLoader)
router.post('/verifyOtp',userController.otpVerify)
export default router;                  