// const express = require("express");
// const {
//   signupAdmin,
//   loginAdmin,
//   checkAdminNotExist,
//   checkAdminExist,
// } = require("../controllers/authController");
// const router = express.Router();
// const {
//   updateAdminDetails,
//   verifyUser,
// } = require("../controllers/updateController");
// const { deleteAdminDetails } = require("../controllers/deleteController");
// const { verifyToken } = require("../utils/tokenGenerator");
// const { verifyOTP, sendOTP } = require("../controllers/otpController");
// const { getWholesalerRequest } = require("../controllers/getUserDetails");

// // Signup for Admin
// // router.post(
// //   "/signup",
// //   validateUserSignUpBody,
// //   checkUserNotExist,
// //   signupAdmin,
// //   sendOTP
// // );
// // Login for Admin
// router.post("/login", validateAdminLoginBody, checkAdminExist, sendOTP);
// router.post("/verify-otp", verifyOTP, loginAdmin);

// // updation and deletion of admin information
// router.use(verifyToken);
// router.get("/wholesaler", getWholesalerRequest);
// router.put("", updateAdminDetails);
// router.delete("", deleteAdminDetails);

// //verify user by admin
// router.put("/verify-user", verifyUser);
// router.post("/logout", (req, res) => {
//   res.clearCookie("token");
//   res.json({ success: true, message: "Logged out successfully" });
// });
// module.exports = router;
