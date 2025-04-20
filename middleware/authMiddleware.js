const checkSession = (req, res, next) => {
    if (req.session.admin) {
        next(); // allow access
    } else {
        res.redirect('/admin'); // redirect to login if not logged in
    }
};

const isLogin = (req, res, next) => {
    if (req.session.admin) {
        return res.redirect('/admin/dashboard'); // already logged in
    } else {
        next(); // not logged in, allow access to login page
    }
};

export default {checkSession , isLogin};