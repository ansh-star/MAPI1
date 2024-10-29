const express = require("express");
const {
  signupAdmin,
  loginAdmin,
  checkAdminNotExist,
  checkAdminExist,
} = require("../controllers/authController");
const router = express.Router();
const {
  validateAdminSignUpBody,
  validateAdminLoginBody,
} = require("../controllers/authBodyChecker");
const {
  updateAdminDetails,
  verifyUser,
} = require("../controllers/updateController");
const { deleteAdminDetails } = require("../controllers/deleteController");
const { verifyToken } = require("../utils/tokenGenerator");
const { verifyOTP, sendOTP } = require("../controllers/otpController");

// Signup for Admin
router.post(
  "/signup-otp",
  validateAdminSignUpBody,
  checkAdminNotExist,
  sendOTP
);
router.post("/verify-signup-otp", verifyOTP, signupAdmin);

// Login for Admin
router.post("/login-otp", validateAdminLoginBody, checkAdminExist, sendOTP);
router.post("/verify-login-otp", verifyOTP, loginAdmin);

// updation and deletion of admin information
router.use(verifyToken);
router.put("", updateAdminDetails);
router.delete("", deleteAdminDetails);

//verify user by admin
router.put("/verify-user", verifyUser);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});
module.exports = router;
