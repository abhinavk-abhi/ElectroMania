import Admin from '../../model/adminModel.js'
import bcrypt from 'bcrypt'


const loadLogin = async (req,res)=>{
    try {
        res.render('admin/login',{errorMessage:" "});

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message : "Couldn't load the login page"
        })
        
    }
}

const login = async (req,res)=>{
    try {
        
        const {email,password} = req.body;
        const admin = await Admin.findOne({email})
        if(!admin) {
            return res.status(401).json({
                success : false,
                message : 'Admin doesn\'t exists',
                redirectUrl : '/'
            });
        }

        const isMatch = await bcrypt.compare(password,admin.password);
        if(!isMatch){
        return res.status(401).json({
            success : false,
            message : "Email or Password is incorrect",
            redirectUrl : '/'

        });
        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
}

const loadHome = async (req,res)=>{
    try {
        res.render('admin/homee.ejs')
    } catch (error) {
        console.error('Error loading admin home page:', error);
        res.status(500).send('Internal Server Error');
    }
}


export default { loadLogin, login, loadHome }