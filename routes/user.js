    import express from 'express';
    const router = express.Router();
    import userController from '../controller/user/userController.js'
    import userAuth from '../middleware/userAuth.js'
    import passport from 'passport';
    import cartController from '../controller/cartController.js'
    import { ProfilingLevel } from 'mongodb';
    import profileController from '../controller/profileController.js';
    import upload from '../middleware/imageUpload.js'
    import addressController from '../controller/addressController.js';


    //User Login
    router.get('/login',userAuth.isLogin,userController.loadLogin)
    router.post('/login',userController.login)
    
    //User registration
    router.post('/register',userAuth.isLogin,userController.registerUser)
    router.get('/signUpOtp',userAuth.isLogin,userController.otpLoader)
    router.post('/verifyOtp',userController.otpVerify)
    
    //User logout
    router.get('/logout',userController.logout)
    
    //Resend otp
    router.post('/resendOtp',userController.resendOtp)
    
    //Forgot password and change password
    router.get('/forgotPassword',userController.loadForgotPass)
    router.post('/forgotPassOtp',userController.sendForgotOtp)
    router.get('/forgotPassOtp',userController.loadForgotPassOtp)
    router.post('/forgotPass/verifyOtp',userController.verifyForgotOtp)
    router.get('/changePassword',userController.loadChangePassword)
    router.post('/changePassword',userController.changePassword)
    
    // Cart
    router.post('/addToCart',cartController.addToCart)
    router.get('/cart',cartController.loadCart)
    router.patch('/cart',cartController.incCartQua)
    router.delete('/cart',cartController.removeProduct)


    //Profile
    router.get('/profile',profileController.loadProfile)
    router.get('/editProfile',profileController.editInformation)
    router.post('/profile/emailOtp',profileController.emailOtp)
    router.post('/userProfileOtp',profileController.otpVerify)
    router.put('/userProfile',upload.single("profilePic"),profileController.saveEdits)

    //Address
    router.get('/address',addressController.loadAddress)
    router.post('/address',addressController.newAddress)

    export default router;                      