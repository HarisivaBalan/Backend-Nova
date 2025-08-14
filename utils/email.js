// const nodemailer=require('nodemailer')

// const sendEmail=async options=>{
//     const transport={
//         host:process.env.SMTP_HOST,
//         port:process.env.SMTP_PORT,
//         auth:{
//             user:process.env.SMTP_USER,
//             pass:process.env.SMTP_PASS
//         }
//     };
//     const transporter=nodemailer.createTransport(transport);
//     const message ={
        
//         from:`${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//         to:options.email,
//         subject:options.subject,
//         text:options.message
//     }
//     await transporter.sendMail(message)

// }
// module.exports=sendEmail;
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // Use secure true for port 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // Avoid self-signed certificate issues
            }
        });

        const message = {
            from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            text: options.message
        };

        const info = await transporter.sendMail(message);
        console.log(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error("Email could not be sent");
    }
};

module.exports = sendEmail;
