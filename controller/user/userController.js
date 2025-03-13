import User from "../../model/userModel.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import nodemailer from 'nodemailer'

const loadLogin = async (req, res) => {
  try {
    res.render("user/login", { errorMessage: " " });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Couldn't load login page",
    });
  }
};

const login = async (req,res)=>{

  try {
    
    const {email,password} = req.body;
    const user = await User.find({email});
    if(!user){
      return res.render('user/login').json({error:"Email doesn't exist . Please signup"})
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.render('user/login').json({error:"Incorrect password. Try again."})
    }

    req.session.user = true;
    res.status(200).json({
      success : true,
      message : "Logged in succefully",
      redirectUrl : '/'
    })
  } catch (error) {
    console.log(error)
  }
}


const otpGenerator = () => Math.floor(1000 + Math.random() * 9000);

const userIdGenerator = () => {
  const prefix = "USR";
  const timestamp = Date.now();
  return `${prefix}${timestamp}`;
};


const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const user = await User.findOne({ email });
    if (user){
      return res.status(400).json({error: "User already exist in this email address"});
    }

    //Generate hashed password and userId
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await userIdGenerator();

    //Creates new user
    const newUser = {
      userId,
      email,
      name: fullName,
      password: hashedPassword,
      phone,
    };

    //Saves in the session to save to the database after otp validation
    req.session.newUser = newUser;

    //Generates otp
    const otp = otpGenerator(); 
    console.log(otp);

    //Store Otp in session for validation of the otp later
    req.session.otp = otp;
    req.session.otpEmail = email;
    req.session.requestForm = "register";

    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.error("Missing email credential in environment variables.");
      return res.status(500).render('user/register',{errorMessage:"Server error, Please try again later"})
    }

    //Configure the nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    //Email content
    const mailer = {
      from: process.env.EMAIL,
      to: email,
      subject: "Verify your email for ElectroMania",
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2118cc;">ElectroMania Account Verification</h2>
                    <p>Hello,</p>
                    <p>Your registered ElectroMania email is:</p>
                    <p style="font-size: 12px; font-weight: bold; color:#2118cc;">${email}</p>
                    <p>Your One-Time Password (OTP) for account verification:</p>
                    <p style="font-size: 24px; font-weight: bold; color:#2118cc;">${otp}</p>
                    <p>Please use this OTP to complete your registration process.</p>
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
      res.status(200).json({ message: "OTP has been sent to your mail" });
    } catch (error) {
      console.error("Error sending otp :", error);
      res.status(500).json({ message: "Server error while sending OTP" });
      // return res.render('user/register',{errorMessage: "Server error while sending OTP"})
      }


  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error occured on our side. Please try again later.",
    });
  }
};


const otpLoader = async (req,res)=>{
    try {
      res.render('user/signupOtp',{errorMessage:" "})
    } catch (error) {
      res.status(500).json({
        message:'Failed to load the page'
      })
    }
}



const otpVerify = async (req,res)=>{
  try {
    const sentOtp = req.session.otp;
    const otpEmail = req.session.email;
    const requestForm = req.session.requestForm;

    const formOtp = req.body.otp;
    console.log(req.session.newUser)

    const {userId,email,password,name,phone} = req.session.newUser;

    console.log("Session OTP:", sentOtp);
    console.log("Form OTP:", formOtp);
    console.log(requestForm)

    if(!sentOtp || !formOtp){
      return res.status(404).json({
        message : "Invalid OTP , Please try again."
      })
    }

    if(sentOtp == formOtp){
      console.log('OTP matched. Verification completed.')

      if(requestForm === 'register'){
        const newUser = new User ({
          userId,
          email,
          password,
          name,
          phone
        })

        await newUser.save()
        console.log('User created')
        return res.status(200).json({
          success:true,
          message : 'OTP verification completed',
          redirectUrl : '/user/login'
        })

      }

      else if(requestForm === 'forgotPass'){
        return res.status(200).json({
          success : true,
          message : 'OTP verified successfully',
          redirectUrl : '/user/forgotPass'
        })
      }else{
        return res.status(400).json({
          success : false,
          message : 'Credentials are missing',
          redirectUrl : '/user/login'
        })
      }
    }
    else{
      return res.status(400).json({
        success : false,
        message : "OTP doesn't match. Please try again"
      })
    }

  } catch (error) {
    console.log(error)
    return   res.status(500).json({
      message: "Error occured on our side. Please try again later.",
      
    });
  }
}



export default { registerUser,
                loadLogin,
                otpLoader,
                otpVerify,
                login,
              };
