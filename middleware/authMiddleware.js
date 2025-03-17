const isLogged = async (req,res,next)=>{
    if(req.session.admin){
        console.log('----')
        return res.redirect('/admin/dashboard');
    }else{
        console.log('-----------------------')
    next()
    }
}

export default {
    isLogged
}