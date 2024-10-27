const express = require("express");
const { signupAdmin, loginAdmin } = require("../controllers/authController");
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

// Signup and Login for Admin
router.post("/signup", validateAdminSignUpBody, signupAdmin);
router.post("/login", validateAdminLoginBody, loginAdmin);

// updation and deletion of admin information
router.use(verifyToken);
router.put("", updateAdminDetails);
router.delete("", deleteAdminDetails);

//verify user by admin
router.put("/verfiy-user", verifyUser);
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true, message: "Logged out successfully" });
});
module.exports = router;
