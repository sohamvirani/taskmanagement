const express = require('express');
const router = express.Router();

const { registerUser, loginUser, logout, forgotPassword, resetPassword,loginLimiter} = require("../controllers/userControllers");



router.post("/registeruser", registerUser);
router.post("/login",loginLimiter,loginUser);
router.get("/logout", logout);
router.post("/forgotPassword", forgotPassword);
router.put("/password/reset/:token", resetPassword);


module.exports=router;