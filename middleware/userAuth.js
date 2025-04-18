const isLogin = async (req, res, next) => {
    try {
        if (req.session.user && !req.session.user.isBlocked) {
            return res.redirect('/');
        }else{
        next();
        }
    } catch (error) {
        console.error("Middleware isLogin error:", error);
        next(error);
    }
};

export default {
    isLogin
}