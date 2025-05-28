import User from '../model/userModel.js'

const isLogin = async (req, res, next) => {
    try {
        if (req.session.user) {
            const user = await User.findOne({_id : req.session.user._id})
            if(!user.isBlocked){
            next(); 
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