const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    user_name:{
      type:String,
      required:[true,"Please Enter Your Name"]
  },
  user_email:{
      type:String,
      required:[true,"Please Enter Your Email"],
      unique:true,
      validate:[validator.isEmail,"Please Enter valid Email"]

  },
  user_password:{
      type:String,
      required:[true,"Please Enter Your Password"],
      minLength: [6, "Password should be greater than 8 characters"],
      select:false,
  },
    role: {
      type: String,
      default: "user",
    },
    resetPasswordToken:String,
    resetPasswordExpires:Date,
    
  },
  { timestamps: true }
);

// Bcrypt Password

userSchema.pre("save", async function (next) {
  if (!this.isModified("user_password")) {
    next();
  }
  this.user_password = await bcrypt.hash(this.user_password, 10);
});

// JWT Authentication

userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  });
};

// Compare Password

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.user_password);
};

//Generating  Password Reset Token

userSchema.methods.getResetPasswordToken = function() {

    // Generating Token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashing and adding ResetPassword Token to UserSchema

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest('hex');

    this.resetPasswordExpires = Date.now() + 15 * 60 *1000

    return resetToken;
}

module.exports = mongoose.model("User", userSchema);
