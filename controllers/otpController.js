const axios = require("axios");
const User = require("../models/User");
const bycrypt = require("bcryptjs");
// Function to send OTP
const sendOTP = async (req, res) => {
  const { mobileNumber } = req.body;
  if (!mobileNumber) {
    return res.status(200).json({
      success: false,
      message: "Mobile number is required",
    });
  }
  try {
    const response = await axios.post(process.env.SEND_OTP, {
      phone: mobileNumber,
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// Function to verify OTP and log in the user based on role
const verifyOTP = async (req, res, next) => {
  const { mobileNumber, otp } = req.body;
  if (!mobileNumber) {
    return res.status(200).json({
      success: false,
      message: "Mobile number is required",
    });
  }
  if (!otp) {
    return res.status(200).json({
      success: false,
      message: "OTP is required",
    });
  }
  try {
    const response = await axios.post(process.env.VERIFY_OTP, {
      phone: mobileNumber,
      otp,
    });

    if (!response.data.status) {
      return res
        .status(200)
        .json({ success: false, message: response.data.message });
    }

    await User.findOneAndUpdate({ mobileNumber }, { mobile_verified: true });

    next();
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

module.exports = { sendOTP, verifyOTP };
