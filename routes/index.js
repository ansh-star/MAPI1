const express = require("express");
const adminRoutes = require("./adminRoutes");
const userAuthRoutes = require("./userAuthRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const getCities = require("../controllers/getCities");
const router = express.Router();

// For user signup and login
router.use("/user", userAuthRoutes);

// product CURD functionality
router.use("/product", productRoutes);

// cart routes
router.use("/cart", cartRoutes);

// get cities
router.get("/cities", getCities);

module.exports = router;
