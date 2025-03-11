import express from 'express';
// const router = express.Router();

const loadHome = async (req,res)=>{
    try {
        return res.render('home')
    } catch (error) {
        console.log('Home page not found')
        res.status(500).send('Server error')
    }
}

const loadRegister = async (req,res)=>{
    try{
        return res.render('user/register');
    }catch(error){
        console.log(error);
        res.status(500).send('Server error');
        res.redirect('/home');
    }
}

export default {loadHome,
    loadRegister
};