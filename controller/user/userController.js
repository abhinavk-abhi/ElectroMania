import User from "../../model/userModel.js";
import Products from '../../model/productModel.js'
import Cart from '../../model/cartModel.js'
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
    const user = await User.findOne({email});
    if(!user){
      return res.status(200).json({
        success : false,
        message : "User doesn't exist.Please sign up",
        redirectUrl : '/user/login'
      })
    }

    if(user.isBlocked){
      return res.status(200).json({
        success : false,
        message : "You are blocked by the admin of the website. For further details contact customer support.",
        redirectUrl : '/user/login'
      })
    }

    const isMatch = await bcrypt.compare(password,user.password);
    if(!isMatch){
      return res.status(200).json({
        success : false,
        message : "Incorrect Email or Password",
        redirectUrl : '/user/login'
      })

    }

   
    req.session.user = user;
    
    
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

const userIdGenerator = async () => {
  const count = await User.countDocuments();
    return `USR${1000 + count + 1}`;
};


const registerUser = async (req, res) => {
  try {

    console.log(`register user accessed`);
    
    const { fullName, email, phone, password } = req.body;

    const user = await User.findOne({ email });
    if (user){
      return res.status(400).json({
          success : false,
          message : "User in this email already exists.",
          redirectUrl : '/user/login'
    })
  }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await userIdGenerator();

    const newUser = {
      userId,
      email,
      name: fullName,
      password: hashedPassword,
      phone,
    };

    
    req.session.newUser = newUser;

    const otp = otpGenerator(); 
    console.log(otp);

    req.session.otp = otp;
    req.session.otpEmail = email;
    req.session.requestForm = "register";
    req.session.expiryTime = Date.now() + 3 * 60 * 1000;

    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.error("Missing email credential in environment variables.");
      return res.status(500).render('user/register',{errorMessage:"Server error, Please try again later"})
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
        redirectUrl : '/user/signUpOtp'
      });
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
    const otpEmail = req.session.otpEmail;
    const requestForm = req.session.requestForm;
    const expiryTime = req.session.expiryTime;

    const formOtp = req.body.otp;
    const {userId,email,password,name,phone} = req.session.newUser;

    console.log("Session OTP:", sentOtp);
    console.log("Form OTP:", formOtp);
    console.log(requestForm)

    if(Date.now()>expiryTime){
      return res.status(400).json({
        message :"The OTP is expired. Try to resend the OTP."
      })
    }

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

const logout = (req,res)=>{
  res.set('Cache-controle','no-store');
  req.session.destroy();
  res.render('user/login',{errorMessage : ''})
}

const resendOtp = async (req,res)=>{
  try {
    let otp = otpGenerator();
  if(req.session.otp === otp){
    otp = otpGenerator()
  }else{
    req.session.otp = otp;
    console.log(otp)
  }

  const email = req.session.otpEmail;
  req.session.expiryTime = Date.now() + 3 * 60 * 1000;
  if (!process.env.EMAIL || !process.env.PASSWORD) {
    console.error("Missing email credential in environment variables.");
    return res.status(500).render('user/register',{errorMessage:"Server error, Please try again later"})
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
      redirectUrl : '/user/signUpOtp'
    });
  } catch (error) {
    console.error("Error sending otp :", error);
    res.status(500).json({ message: "Server error while sending OTP" });
  }

  } catch (error) {
    
    console.log(error);
    res.status(302).json({
      success : false,
      message : "Failed to sent OTP. Please try again",
      redirectUrl : "/user/verifyOtp"
    })
  }
}

const loadForgotPass = async (req,res)=>{
  try {
    res.render('user/forgotPass',{errorMessage : ""})
  } catch (error) {
    res.status(500).json({
      message : "Something went wrong. Failed to load forgot  password page.",
      redirectUrl : '/user/login'
    })
  }
}

const sendForgotOtp = async (req,res)=>{
  try {
    let otp = otpGenerator()
    console.log("forgot pass otp :",otp)
    const {email} = req.body;
    const user = await User.findOne({email : email})

    if(!user){
      return res.status(200).json({
        message : "No existing user in this email Id"
      })
    }
  
    if (!process.env.EMAIL || !process.env.PASSWORD) {
      console.error("Missing email credential in environment variables.");
      return res.status(500).render('user/login',{errorMessage:"Server error, Please try again later"})
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
      to: email,
      subject: "OTP for resetting your password",
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2118cc;">ElectroMania Account Password Reset</h2>
                    <p>Hello,</p>
                    <p>Your One-Time Password (OTP) for account password reset :</p>
                    <p style="font-size: 24px; font-weight: bold; color:#2118cc;">${otp}</p>
                    <p>Please use this OTP to reset your account password.</p>
                    <p>The OTP is only valid for three minutes.<p>
                    <h5>If you did not perform this action , please contact - <a href="mailto:electromaniasupport@gmail.com">electromaniasupport@gmail.com</a></h5>
                    <p>Best regards,<br>The ElectroMania Team</p>
                    <hr style="border: 0; border-top: 1px solid #eee;">
                    <p style="font-size: 12px; color: #777;">This is an automated message. Please do not reply.</p>
                </div>
            `,
    };
  
  
    //Send Email
    try {
      await transporter.sendMail(mailer);

    req.session.forgotOtp = otp;
    req.session.user = user;

      res.status(200).json({ 
        success : true,
        message: "OTP has been sent to your mail" ,
        redirectUrl : '/user/forgotPassOtp'
      });
    } catch (error) {
      console.error("Error sending otp :", error);
      res.status(500).json({ message: "Server error while sending OTP" });
    }

   

 
  } catch (error) {
    console.log(error)
    return res.status(500).send(error.message)
  }
}


const loadForgotPassOtp = async (req,res)=>{
  try {
    res.render('user/forgotPassOtp',{errorMessage:""});

  } catch (error) {
    console.log(error)
    res.status(500).send('Failed to load the page')
  }

} 


const  verifyForgotOtp = async (req,res)=>{
  try {
    const otp = req.session.forgotOtp;
    const formOtp = req.body.otp;


console.log('otp is :'+ otp)

    if(otp == formOtp){
      return res.status(200).json({
        message :"OTP verified successfully."
      })
    }else{
      return res.status(400).json({
        message : "Invalid OTP Try again"
      })
    }
  } catch (error) {
    return res.status(500).send("Error occured in the verification process.")
  }
}

const loadChangePassword = async (req,res)=>{
  try {
    res.render('user/changePassword',{errorMessage : ""})
  } catch (error) {
    console.log("Change password page error :" , error)
    return res.status(500).send("Failed to load the page . Please try again later")
  }
}

const changePassword = async (req,res)=>{
  console.log('kdfkljkf;j')
  try {
    const {newPassword} = req.body;
    const user = req.session.user;

    const hashedPassword = await bcrypt.hash(newPassword,10)

    await User.findByIdAndUpdate({_id : user._id},
      {$set :{password : hashedPassword}}
    )

    req.session.user = null;

    return res.status(200).json({
      message : "Password changed successfully",
      redirectUrl : '/user/login'
    })

  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message : "Failed to update the password",
      redirectUrl : '/user/login'
    })
  }
}




export default { registerUser,
                loadLogin,
                otpLoader,
                otpVerify,
                login,
                logout,
                resendOtp,
                loadForgotPass,
                verifyForgotOtp,
                sendForgotOtp,
                loadForgotPassOtp,
                loadChangePassword,
                changePassword,
                
              };
