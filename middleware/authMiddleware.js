const isLogged = async (req,res,next)=>{
    if(req.session.admin){
        return res.redirect('/admin/dashboard');
    }else{
    next()
    }
}

export default {
    isLogged
}