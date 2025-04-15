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

const otpGenerator = () => Math.floor(1000 + Math.random() * 9000);

const emailOtp = async (req,res)=>{
    try {
        const {email} = req.body;
        const otp = await otpGenerator()

    } catch (error) {
        
    }
}

const saveEdits = async (req,res)=>{
    try {
        
    } catch (error) {
        
    }
}

export default { 
    loadProfile,
    editInformation,
    emailOtp,
    saveEdits
}