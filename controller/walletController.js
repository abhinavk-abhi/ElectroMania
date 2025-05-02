import User from  '../model/userModel.js'

const loadWallet = async (req,res)=>{
    try {
        const userId = req.session.user._id || req.user._id;

        const user = await User.findOne({_id : userId})

        return res.render("user/wallet" , {user})

    } catch (error) {
        console.log(error)
    }
}

export default {
    loadWallet
}