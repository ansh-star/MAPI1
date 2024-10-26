const express = require("express");
const { signupUser, loginUser } = require("../controllers/authController");
const {
  validateUserSignupBody,
  validateUserLoginBody,
} = require("../controllers/authBodyChecker");
const { updateUserDetails } = require("../controllers/updateController");
const { verifyToken } = require("../utils/tokenGenerator");
const { deleteUserDetails } = require("../controllers/deleteController");

const router = express.Router();

// Route for user signup
router.post("/signup", validateUserSignupBody, signupUser);

// Route for user login
router.post("/login", validateUserLoginBody, loginUser);

// Middleware to verify the token for subsequent routes
router.use(verifyToken);

// Route to update user details
router.put("", updateUserDetails);

// Route to delete user details
router.delete("", deleteUserDetails);

// Route for user logout
router.post("/logout", (req, res) => {
  // Clear the authentication cookie containing the token
  res.clearCookie("token");

  // Respond with a success message
  res.json({ success: true, message: "Logged out successfully" });
});

module.exports = router;
