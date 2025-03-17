import express from 'express';
const router = express.Router();
import userController from '../controller/user/userController.js'
import userAuth from '../middleware/userAuth.js'

router.get('/login',userAuth.isLogin,userController.loadLogin)
router.post('/login',userController.login)
router.post('/register',userController.registerUser)
router.get('/signUpOtp',userController.otpLoader)
router.post('/verifyOtp',userController.otpVerify)
router.get('/logout',userController.logout)

export default router;                  