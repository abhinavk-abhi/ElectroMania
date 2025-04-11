import User from '../model/userModel.js'

const loadProfile = async (req,res)=>{
    try {
        const user = req.session.user;

        res.render('user/profile',{user:user})
    } catch (error) {
        console.log("loadProfile error",error)
        return res.status(500).json({error : "Unexpected error, Try again later."})
    }
}

const editInformation = async (req,res)=>{
    console.log('hi')
    try {
        const id = req.query.userId;
        console.log(id)
        const user = await User.findOne({_id : id})
        console.log(user)
        return res.render('user/editInformation',{user : user})

    } catch (error) {
        console.log("LoadeditInformation error",error)
        return res.status(500).json({error : "Failed to fetch details."})
    }
}

export default { 
    loadProfile,
    editInformation,

}