    import express from 'express';
    const router = express.Router();
    import userController from '../controller/user/userController.js'
    import userAuth from '../middleware/userAuth.js'
    import passport from 'passport';

    router.get('/login',userAuth.isLogin,userController.loadLogin)
    router.post('/login',userController.login)
    router.post('/register',userAuth.isLogin,userController.registerUser)
    router.get('/signUpOtp',userAuth.isLogin,userController.otpLoader)
    router.post('/verifyOtp',userController.otpVerify)
    router.get('/logout',userController.logout)
    router.post('/resendOtp',userController.resendOtp)
    router.get('/forgotPassword',userController.loadForgotPass)
    router.post('/forgotPassOtp',userController.sendForgotOtp)
    router.get('/forgotPassOtp',userController.loadForgotPassOtp)
    router.post('/forgotPass/verifyOtp',userController.verifyForgotOtp)
    router.get('/changePassword',userController.loadChangePassword)
    router.post('/changePassword',userController.changePassword)




    export default router;                  