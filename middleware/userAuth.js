
const isLogin = async (req,res,next)=>{
    if(req.session.user){
        res.redirect('/')
    }else{
        next()
    }
}

export default {
    isLogin
}