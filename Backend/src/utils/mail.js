import nodemailer from 'nodemailer'


const transporter = nodemailer.createTransport({
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});


export const sentOtp = async(to , otp) => {
    const result = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: `OTP For Order Confirmation (BiteRush)`,
        html: `<p>Your otp for accepting you order is : <b>${otp}</b>. It will expires in 10 min. </p>`
    })

    console.log(result);
    
}


