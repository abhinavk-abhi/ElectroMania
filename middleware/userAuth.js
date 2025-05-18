const isLogin = async (req, res, next) => {
    try {
        if (req.session.user && !req.session.user.isBlocked) {
            next(); 
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