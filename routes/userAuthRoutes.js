const express = require("express");
const {
  signupUser,
  loginUser,
  checkUserNotExist,
  checkUserExist,
} = require("../controllers/authController");
const {
  validateUserSignupBody,
  validateUserLoginBody,
} = require("../controllers/authBodyChecker");
const {
  updateUserDetails,
  verifyUser,
} = require("../controllers/updateController");
const { verifyToken, verifyAdmin } = require("../utils/tokenGenerator");
const { deleteUserDetails } = require("../controllers/deleteController");
const { sendOTP, verifyOTP } = require("../controllers/otpController");
const {
  userDetails,
  getWholesalerRequest,
} = require("../controllers/getUserDetails");

const router = express.Router();

// Route for user signup
router.post(
  "/signup",
  validateUserSignupBody,
  checkUserNotExist,
  signupUser,
  sendOTP
);
// Route for user login
router.post("/login", validateUserLoginBody, checkUserExist, sendOTP);

// Route to verify OTP
router.post("/verify-otp", verifyOTP, loginUser);

// Middleware to verify the token for subsequent routes
router.use(verifyToken);

// get user details
router.get("/details", userDetails);

// Route to update user details
router.put("", updateUserDetails);

// Route to delete user details
router.delete("", deleteUserDetails);

// get wholesaler requests
router.get("/wholesaler", verifyAdmin, getWholesalerRequest);

router.put("/verify-user", verifyAdmin, verifyUser);

// Route for user logout
router.post("/logout", (req, res) => {
  // Clear the authentication cookie containing the token
  res.clearCookie("token");

  // Respond with a success message
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
