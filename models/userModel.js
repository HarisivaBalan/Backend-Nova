const mongoose = require('mongoose');
const validator=require('validator');
const bcrypt=require('bcrypt')
const jwt=require('jsonwebtoken')
const crypto=require('crypto')
const userSchema=new mongoose.Schema({
    name :{
        type:String,
        required:[true,'Please enter name']
    },
    // email:{
    //     type:String,
    //     required:[true,'Please enter email'],
    //     unique:true,
    //     validate:[validator.isEmail,'PLease Enter valid Email Address']
    // },
    // password:{
    //     type: String,
    //     required:[true,'please enter password'],
    //     maxlength:[8,"Password cannot exceed the limit"],
    //     select:false
    // },
    email: {
        type: String,
        required: [true, 'Please enter email'],
        unique: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: 'Please enter a valid Email Address'
        },
        match: [/^[a-zA-Z0-9._%+-]+@gmail\.com$/, 'Email must be a valid Gmail address']
    },
    password: {
        type: String,
        required: [true, 'Please enter password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        validate: {
            validator: (value) => /[a-z]/.test(value) && /[A-Z]/.test(value) && /[!@#$%^&*(),.?":{}|<>]/.test(value),
            message: 'Password must contain at least one lowercase letter, one uppercase letter, and one special character'
        },
        select: false
    },
    avatar:{
        type:String,
        
    },
    role:{
        type:String,
        default:'user'
    },
    resetPasswordToken:String,
    resetPasswordTokenExpire:Date,
    createdAt:{
        type:Date,
        default:Date.now
        
    }
})
// encrypt the password before save into db
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.getJwtToken=function(){
    return jwt.sign({id : this.id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}
userSchema.methods.isValidPassword= function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password)
}
userSchema.methods.getResetToken=function(){
    //Generate a token
    const token=crypto.randomBytes(20).toString('hex');
    //Generate hash and set to resetpassw token
    this.resetPasswordToken=crypto.createHash('sha256').update(token).digest('hex');
    //set token expires time upto 5 minutes
    this.resetPasswordTokenExpire=Date.now()+5*60*1000;
    return token;
}



let model =mongoose.model('User',userSchema)

module.exports= model;