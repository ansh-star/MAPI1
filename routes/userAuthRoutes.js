const express = require("express");
const {
  signupUser,
  loginUser,
  checkUserNotExist,
  checkUserExist,
  loginUserWithPassword,
} = require("../controllers/authController");
const {
  validateUserSignupBody,
  validateUserLoginBody,
} = require("../controllers/authBodyChecker");
const {
  updateUserDetails,
  verifyUser,
  makeAdmin,
} = require("../controllers/updateController");
const { verifyToken, verifyAdmin } = require("../utils/tokenGenerator");
const {
  deleteUserDetails,
  deleteUser,
} = require("../controllers/deleteController");
const { sendOTP, verifyOTP } = require("../controllers/otpController");
const {
  userDetails,
  getWholesalerRequest,
  getRetailerRequest,
} = require("../controllers/getUserDetails");
const { searchMobileNumber } = require("../controllers/searchController");
const {
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  getUserAddress,
} = require("../controllers/addressContorller");

const router = express.Router();

// Route for user signup
router.post(
  "/signup",
  validateUserSignupBody,
  checkUserNotExist,
  signupUser,
  sendOTP
);
// Route for sending otp login
router.post("/send-otp", sendOTP);

// Route for user login
router.post(
  "/login",
  validateUserLoginBody,
  checkUserExist,
  loginUserWithPassword
);

// Route to verify OTP
router.post("/verify-otp", verifyOTP, loginUser);

// Middleware to verify the token for subsequent routes
router.use(verifyToken);

// get user details
router.get("/details", userDetails);

router.get("/search", searchMobileNumber);

// Route to update user details
router.put("", updateUserDetails);

// get wholesaler requests
router.get("/wholesaler", verifyAdmin, getWholesalerRequest);

//get retailer requests
router.get("/retailer", verifyAdmin, getRetailerRequest);

// Route to verify a user
router.put("/verify-user", verifyAdmin, verifyUser);

// Route to make a user an admin
router.put("/make-admin", verifyAdmin, makeAdmin);

// Route to get user address
router.get("/address", getUserAddress);

// Route to add user address
router.post("/address", addUserAddress);

// Route to update user address
router.put("/address", updateUserAddress);

// Route to delete user address
router.delete("/address", deleteUserAddress);

router.delete("", deleteUser);

// Route to delete user details
router.delete("/:userId", verifyAdmin, deleteUserDetails);

// Route for user logout
router.post("/logout", (req, res) => {
  // Clear the authentication cookie containing the token
  res.clearCookie("token");

  // Respond with a success message
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
