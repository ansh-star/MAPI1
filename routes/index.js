const express = require("express");
const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const userAuthRoutes = require("./userAuthRoutes");
const productRoutes = require("./productRoutes");
const router = express.Router();

// For sending and verifying OTP
router.use("/auth", authRoutes);

// For admin signup and login
router.use("/admin", adminRoutes);

// For user signup and login
router.use("/user", userAuthRoutes);

// product CURD functionality
router.use("/product", productRoutes);
module.exports = router;
