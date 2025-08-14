// routes/otp.js
const express = require("express");
const router = express.Router();
const Otp = require("../models/otpModel");
//const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const user=require('../models/userModel')
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  // const otp = otpGenerator.generate(6, {
  //   digits: true,
  //   alphabets: false,
  //   upperCase: false,
  //   specialChars: false,
  // });
  // const otp = generateOTP(6, {
  //   upperCaseAlphabets: false,
  //   lowerCaseAlphabets: false,
  //   digits: true,
  //   specialChars: false,
  // });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  console.log("Generated OTP:", otp);

  try {
    await Otp.deleteMany({ email }); // Clear previous OTPs

    const newOtp = new Otp({ email, otp });
    await newOtp.save();

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp} and expires in 5 minutes`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("OTP Email sent:", info.response);

    res.status(200).json({ message: "OTP sent successfully!" });
  } catch (err) {
    console.error("Error sending OTP:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });

    if (!validOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const existingUser = await user.findOne({ email });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await Otp.deleteMany({ email }); // cleanup

    return res.status(200).json({
      message: "OTP verified successfully!",
      user: existingUser, // 👈 send user object properly
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ message: "Server error during OTP verification" });
  }
});
module.exports=router;