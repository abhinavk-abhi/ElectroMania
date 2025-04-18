import User from '../model/userModel.js'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'

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
    const mailer = {
        from: process.env.EMAIL,
        to: userEmail,
        subject: "Email verification for Profile updation.",
        html: `
                  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #2118cc;">ElectroMania Email Verification</h2>
                      <p>Hello,</p>
                      <p>Your One-Time Password (OTP) for email verification:</p>
                      <p style="font-size: 24px; font-weight: bold; color:#2118cc;">${otp}</p>
                      <p>Please use this OTP to complete your profile updation.</p>
                      <p>The OTP is only valid for three minutes.<p>
                      <h5>If you did not request this registration, please contact - <a href="mailto:electromaniasupport@gmail.com">electromaniasupport@gmail.com</a></h5>
                      <p>Best regards,<br>The ElectroMania Team</p>
                      <hr style="border: 0; border-top: 1px solid #eee;">
                      <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
                  </div>
              `,
      };

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
        const userId = req.query.id;
        let {name,email,gender,mobile} = req.body
        const user = await User.findOne({_id : userId})
        console.log(req.body)
        if(!userId || !name || ! email || !gender || !mobile ){
            console.log("erroorrr")
            return res.status(404).json({error : "Credentials are missing"})
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

export default { 
    loadProfile,
    editInformation,
    emailOtp,
    saveEdits,
    otpVerify
}