// const sendToken = (user,statusCode,res)=>{
//     //creating tokens for specific user
//     const token=user.getJwtToken();
//     //setting cookie
//     const options ={
//         expires: new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME *24*60*60*1000),
//         httpOnly:true,
//     }
//     res.status(statusCode)
//     .cookie('token',token,options)
//     .json({
//         success:true,
//         token,
//         user
//     })

// }
const sendToken = (user, statusCode, res) => {
    // Generate JWT Token
    const token = user.getJwtToken();

    // ✅ Secure Cookie Options
    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
        httpOnly: true, // Secure from XSS attacks
        secure: process.env.NODE_ENV === "production", // Only in HTTPS mode
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    };

    // ✅ Send Cookie & JSON Response
    res.status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user,
        });
};

module.exports = sendToken;