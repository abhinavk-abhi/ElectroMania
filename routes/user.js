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
    import wishlistController from "../controller/wishlistController.js";
    import checkOutController from '../controller/checkOutController.js';
    import orderController from '../controller/orderController.js';
    import walletController from '../controller/walletController.js'


    //User Login
    router.get('/login',userController.loadLogin)
    router.post('/login',userController.login)
    
    //User registration
    router.post('/register',userController.registerUser)
    router.get('/signUpOtp',userController.otpLoader)
    router.post('/verifyOtp',userController.otpVerify)
    
    //User logout
    router.get('/logout',userController.logout)
    
    //Resend otp
    router.post('/resendOtp',userAuth.isLogin,userController.resendOtp)
    
    //Forgot password and change password
    router.get('/forgotPassword',userController.loadForgotPass)
    router.post('/forgotPassOtp',userController.sendForgotOtp)
    router.get('/forgotPassOtp',userController.loadForgotPassOtp)
    router.post('/forgotPass/verifyOtp',userController.verifyForgotOtp)
    router.get('/changePassword',userController.loadChangePassword)
    router.post('/changePassword',userController.changePassword)
    
    // Cart
    router.post('/addToCart',userAuth.isLogin,cartController.addToCart)
    router.get('/cart',userAuth.isLogin,cartController.loadCart)
    router.patch('/cart',userAuth.isLogin,cartController.incCartQua)
    router.delete('/cart',userAuth.isLogin,cartController.removeProduct)

    //Wishlist
    router.get('/wishlist',userAuth.isLogin,wishlistController.loadWishlist)
    router.post('/addToWishlist',userAuth.isLogin,wishlistController.addToWishlist)
    router.delete('/wishlist/remove',userAuth.isLogin,wishlistController.remove)

    //Profile
    router.get('/profile',userAuth.isLogin,profileController.loadProfile)
    router.get('/editProfile',userAuth.isLogin,profileController.editInformation)
    router.post('/profile/emailOtp',userAuth.isLogin,profileController.emailOtp)
    router.post('/userProfileOtp',userAuth.isLogin,profileController.otpVerify)
    router.put('/userProfile',userAuth.isLogin,upload.single("profilePic"),profileController.saveEdits)

    //Address
    router.get('/address',userAuth.isLogin,addressController.loadAddress)
    router.get('/addAddress',userAuth.isLogin,addressController.loadAddAddress)
    router.post('/address',userAuth.isLogin,addressController.newAddress)
    router.get('/editaddress',userAuth.isLogin,addressController.loadEditAddress);
    router.delete('/address',userAuth.isLogin,addressController.deleteAddress)
    router.get('/checkOutAddress',userAuth.isLogin,addressController.addCheckOutAddress)
    router.post('/checkOutAddress',userAuth.isLogin,addressController.saveCheckOutAddress)

    //Privacy settings
    router.get('/privacy',userAuth.isLogin,profileController.privacy)
    router.post('/check-old-password', userAuth.isLogin ,profileController.checkOldPassword)
    router.post('/privacy',userAuth.isLogin, profileController.changePass)


    //Checkout
    router.get('/checkout',userAuth.isLogin,checkOutController.loadCheckOut)
    router.post('/placeOrder',userAuth.isLogin,checkOutController.placeOrder)
    router.get('/success',userAuth.isLogin,checkOutController.orderSuccess)

    //user orders 
    router.get('/orders',userAuth.isLogin , orderController.loadOrders)
    router.get('/orders/:orderId',userAuth.isLogin,orderController.orderDetail)
    router.post('/return-item',userAuth.isLogin, orderController.returnOrder)
    router.post('/cancel-item',userAuth.isLogin, orderController.cancelItem)
    router.post('/cancel-return',userAuth.isLogin,orderController.cancelReturn)


    //Wallet 
    router.get('/wallet',userAuth.isLogin,walletController.loadWallet);


    //Invoice
    router.get('/download-invoice/:orderId',userAuth.isLogin,orderController.invoice)


    export default router;