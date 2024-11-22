const axios = require("axios");

// Function to send OTP
const sendOTP = async (req, res) => {
  const { mobileNumber } = req.body;

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
