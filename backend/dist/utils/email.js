import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
export const sendVerificationEmail = async (email, verificationToken) => {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your SmartSale Account',
        html: `
      <h2>Welcome to SmartSale!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link expires in 24 hours.</p>
    `,
    };
    return transporter.sendMail(mailOptions);
};
//# sourceMappingURL=email.js.map