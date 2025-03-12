const loadHome = async (req,res)=>{
    try {
        return res.render('home')
    } catch (error) {
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