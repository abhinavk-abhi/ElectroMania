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

        req.session.admin = admin;
        return res.status(200).json({
            success: true,
            message : 'Logged in successfully',
            redirectUrl : '/admin/dashboard'
        }) 


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            error: "Server error during login"
        });
    }
}

const loadHome = async (req,res)=>{
    try {
        // res.render('admin/dashboard.ejs')
        res.render('admin/dashboard')
    } catch (error) {
        console.error('Error loading admin home page:', error);
        res.status(500).send('Internal Server Error');
    }
}

const loadCustomer = async (req,res)=>{
    try {
      res.render('admin/customers')
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Error loading the page",
            redirectUrl : '/admin/dashboard'
        })
    }
}

const loadProducts = async (req,res)=>{
    try {
        res.render('admin/products')
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success : false,
            message : "Error loading the page",
            redirectUrl : '/admin/dashboard'
        })
        
    }
}

const logout = async (req,res)=>{
    try {
        req.session.admin = null;
        req.session.destroy()
        res.render('admin/login' , {errorMessage : ""})
    } catch (error) {
        console.log("logout error => " , error)
        res.status(500).json({error : "Internal server error"})
    }
}



export default { 
                loadLogin, 
                login, 
                loadHome, 
                loadCustomer , 
                loadProducts,
                logout
            }