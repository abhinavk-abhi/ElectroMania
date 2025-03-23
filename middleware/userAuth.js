const isLogin = async (req, res, next) => {
    try {
        if (req.session.user && req.session.user.userId) {
            return res.redirect('/');
        }
        next();
    } catch (error) {
        console.error("Middleware isLogin error:", error);
        next(error);
    }
};

export default {
    isLogin
}