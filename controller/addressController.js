import User from '../model/userModel.js'
import Address from '../model/addressModel.js'

const loadAddress = async (req,res)=>{
    try {
        const user = req.session.user
        const address = user.address;

        if(!user){
            return res.redirect('/')
        }

        if(address){
            return res.render('user/address',{user : user,
                address : address
            })
        }else{
            return res.render('user/address',{
                user : user ,
                address : null
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({error : "Internal server error."})
    }
}

const newAddress = async (req,res)=>{
    try {
        console.log(req.body)
    } catch (error) {
        
    }
}

export default {
    loadAddress,
    newAddress
}