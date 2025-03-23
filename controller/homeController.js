import User from '../model/userModel.js'


const loadHome = async (req,res)=>{
    try {
        const user = req.session.user;

        if(user){
            const userData = await User.findOne({_id:user})
            // console.log(userData);
            
            res.render('home',{user:userData})
        }else{
            console.log('else accessed');
            
        return res.render('home.ejs')
        }
    } catch (error) {
        console.log(error)
        console.log('Home page not found')
        res.status(500).send('Server error')
    }
}

const loadRegister = async (req,res)=>{
    try {
        res.render('user/register',{errorMessage:" "})
    }catch(error){
        console.log('Register page not found')
        res.status(500).send('Server error')
    }
}

// const registerUser = async (req,res)=>{

//     const {fullName,email,phone,password} = req.body;
//     console.log(fullName)
// }


export default {loadHome,loadRegister};