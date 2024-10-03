const ErrorHandler = require("../util/errorhander");
const CatchError = require("../middleware/tryCatchError");
const User = require("../models/userModel");
const sendToken = require("../util/jwtToken");
const sendEmail = require("../config/nodemailer");
const crypto = require("crypto");
const rateLimit = require('express-rate-limit');



/// Register a User

exports.registerUser = CatchError(async (req, res, next) => {
  const { user_name, user_email, user_password } = req.body;

  const user = await User.create({
    user_name,
    user_email,
    user_password,

  });

  sendToken(user, 201, res);
});
  
  /// Login User
  
  exports.loginUser = CatchError(async (req, res, next) => {
    const { user_email, user_password } = req.body;
  
    if (!user_email || !user_password) {
      return next(new ErrorHandler("Please enter Email and Password", 400));
    }
  
    const user = await User.findOne({ user_email }).select("+user_password");
  
    if (!user) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(user_password);
  
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid Email or Password", 401));
    }
  
    sendToken(user, 200, res);
  });
  
  /// Logout User
  
  exports.logout = CatchError(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    });
  
    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  });
 
/// Forgot Password

exports.forgotPassword = CatchError(async (req, res, next) => {
  const user = await User.findOne({ user_email: req.body.user_email });

  if (!user) {
    return next(new ErrorHandler("user not found", 404));
  }

  // Get ResetPassword Token

  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const ResetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `your password reset token is :- \n\n ${ResetPasswordUrl} \n\nIf you have not requested this email then, please ignore it `;

  try {
    await sendEmail({
      email: user.user_email,
      subject: `Ecommers Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.user_email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

/// Reset password

exports.resetPassword = CatchError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Password Password Token is Invalid or has been expired",
        400
      )
    );
  }

  if (req.body.user_password !== req.body.confirm_password) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  user.user_password = req.body.user_password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  sendToken(user, 200, res);
});





// Define the rate limiter for login attempts
exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  headers: true,
});