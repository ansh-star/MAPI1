const axios = require("axios");
const Admin = require("../models/Admin");
const { generateToken } = require("../utils/tokenGenerator"); // Assume token generation function is available
const User = require("../models/User");

// Function to send OTP
const sendOTP = async (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({
      success: false,
      message: "Phone number must be exactly 10 digits",
    });
  }

  try {
    const response = await axios.post(process.env.SEND_OTP, { phone });
    res.json({
      success: true,
      message: "OTP sent successfully",
      sessionId: response.data.Details, // Session ID for further verification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error sending OTP",
      error: error.message,
    });
  }
};

// Function to verify OTP and log in the user based on role
const verifyOTP = async (req, res) => {
  const { phone, otp, adminKey } = req.body;

  if (!phone || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Phone and OTP are required" });
  }

  try {
    const response = await axios.post(process.env.VERIFY_OTP, { phone, otp });

    if (response.data.Status !== "Success") {
      return res.status(200).json({ success: false, message: "Invalid OTP" });
    } else {
      if (adminkey) {
        const admin = await Admin.findOne({ mobileNumber: phone, adminKey });
        if (!admin) {
          return res
            .status(403)
            .json({ success: false, message: "Invalid Admin credentials" });
        }
      }
      return res.status.json({ success: true, message: "Valid OTP" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message,
    });
  }
};

module.exports = { sendOTP, verifyOTP };
