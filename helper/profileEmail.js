export function profileMailer (userEmail,otp){
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
      return mailer;
}
