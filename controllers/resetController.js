const User = require("../models/User");
const bcrypt = require("bcryptjs");
const resetPassword = async (req, res) => {
  const { mobileNumber, password } = req.body;
  try {
    const encryptedPassword = bcrypt.hashSync(password, 10);
    const user = await User.findOneAndUpdate(
      { mobileNumber },
      { password: encryptedPassword }
    );
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    return res.status(201).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      error: "Failed to reset password",
      details: error.message,
    });
  }
};
module.exports = { resetPassword };
