import User from '../model/userModel.js'

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            const id = req.session.user._id || req.user._id || null;
            const user = await User.findOne({_id : id})
            if(!user.isBlocked){
            next(); 
            }else{
                 res.render('user/login',{errorMessage : "You are blocked by the admin."})
            }
        } else {
            res.redirect('/user/login'); 
        }
    } catch (error) {
        console.error("Middleware isLogin error:", error);
        next(error);
    }
}


export default {
    isLogin
}