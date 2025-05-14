import User from '../model/userModel.js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import bcrypt from "bcrypt";
import { profileMailer } from '../helper/profileEmail.js'

const loadProfile = async (req,res)=>{
    try {
        const user = req.session.user;

        res.render('user/profile',{user:user})
    } catch (error) {
        console.log("loadProfile error",error)
        return res.status(500).json({error : "Unexpected error, Try again later."})
    }
}

const editInformation = async (req, res) => {
    try {
        // Use session user ID or query parameter
        const id = req.query.userId || (req.session.user && req.session.user._id);
        
        if (!id) {
            // Redirect to login or profile if no ID is found
            return res.redirect('/user/profile');
        }
        
        const user = await User.findOne({ _id: id });
        
        if (!user) {
            // Handle case when no user is found
            return res.status(404).render('error', { message: 'User not found' });
            // Or redirect: return res.redirect('/user/profile');
        }
        
        return res.render('user/editInformation', { user: user });
    } catch (error) {
        console.log("LoadeditInformation error", error);
        return res.status(500).json({ error: "Failed to fetch details." });
    }
};

const otpGenerator = () => Math.floor(1000 + Math.random() * 9000);

const emailOtp = async (req,res)=>{
    try {
        console.log(req.body)
        const {userEmail} = req.body;
        console.log("email of requested user"+userEmail)
        if(!userEmail){
            return res.status(404).json({error : "Email credentials are missing"})
        }
        const otp = await otpGenerator()
        console.log("profile otp->>  "+ otp)

        req.session.otp = otp;
        req.session.otpEmail = userEmail;
        req.session.requestForm = "emailUpdate";
        req.session.expiryTime = Date.now() + 3 * 60 * 1000;

        if (!process.env.EMAIL || !process.env.PASSWORD) {
            console.error("Missing email credential in environment variables.");
            return res.status(500).render('user/profile',{error:"Server error, Please try again later"})
          }

          //Configure the nodemailer
              const transporter = nodemailer.createTransport({
                service: "gmail",
                port : 587,
                secure : false,
                requireTLS : true,
                auth: {
                  user: process.env.EMAIL,
                  pass: process.env.PASSWORD,
                },
              });



               //Email content
        const mailer = profileMailer(userEmail,otp)

      //Send Email
    try {
        await transporter.sendMail(mailer);
        res.status(200).json({ 
          success : true,
          message: "OTP has been sent to your mail" ,
        });
      } catch (error) {
        console.error("Error sending otp :", error);
        res.status(500).json({ error: "Server error while sending OTP" });
        }
  

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error : "Failed to send OTP"})
    }
}

const otpVerify = async (req,res)=>{
    try {
      
        const  {formOtp , formEmail , requestForm } = req.body.details;
        const otp = req.session.otp;
        if(!formOtp || !formEmail || !requestForm){
            return res.status(404).json({error : "Credentials are missing"})
        }

        if(requestForm == "emailUpdate"){
            if(formOtp == otp ){
                return res.status(200).json({success : true})
            }else{
                return res.status(400).json({error : "Invalid OTP"})
            }
        }else{
            return res.status(404).json({error : "Form credentials are missing."})
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error : "Internal server errro"})
    }
}

const saveEdits = async (req,res)=>{
 
    try {      
        const userId = req.session.user._id || req.session._id;
      
        let {name,email,gender,mobile} = req.body
        const user = await User.findOne({_id : userId})
        
        if(!userId || !name || ! email || !gender || !mobile ){
            return res.status(404).json({error : "Missdwe"})
        }   
        if(!user){
            return res.status(404).json({error : "User not found"})
        }

        if (req.file) {
            user.profilePic = req.file.path;
        }
        user.name = name 
        user.email = email
        user.gender = gender
        user.phone = mobile

        await user.save()
        req.session.user = user;

        return res.status(200).json({message : "Profile updated successfully."})
          
    } catch (error) {
        console.log(error)
        return res.status(500).json({error : "Internal server errro."})
    }
}

const privacy = async (req,res)=>{
    try {
        const user = req.session.user || req.user;
         
        res.render("user/privacy", {user})
    } catch (error) {
        console.log("load privacy error =>", error)
        return res.status(500).json({ message : "Failed to  load privacy page."})
    }
}

const checkOldPassword = async (req,res)=>{
    try {
        const user = req.session.user 
        const {oldPassword} = req.body;
        let password 
        if(user.password){
            password = user.password
        } else {
         const findedUser = await User.findOne({_id: user._id})
         password = findedUser.password
        }

        const isMatch = await bcrypt.compare(oldPassword,password)

        if(isMatch){
            return res.status(200).json({
                valid : true
            })
        } else {
            return res.status(401).json({
                valid : false
            })
        }

    } catch (error) {
        console.log("checking old password error =>>>" , error)
    }
}

const changePass = async (req,res)=>{
    try {
        const {oldPassword,newPassword} = req.body;
        const userId = req.session.user._id;

        const hashedPass = await bcrypt.hash(newPassword,10)

        const user = await User.findOneAndUpdate(
            {_id : userId},
            { $set : {password : hashedPass}}
        )

        return res.status(200).json({ message : "Password updated successfully." })

    } catch (error) {
        console.log("Password update  error from privacy =>",error)
        return res.status(500).json({ message :"Internal server error."})
    }
}


export default { 
    loadProfile,
    editInformation,
    emailOtp,
    saveEdits,
    otpVerify,
    privacy,
    checkOldPassword,
    changePass
}