const express = require("express");
const { sendOTP, verifyOTP } = require("../controllers/otpController");
const router = express.Router();

// OTP routes
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

module.exports = router;
