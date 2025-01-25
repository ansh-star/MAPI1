const express = require("express");
const userAuthRoutes = require("./userAuthRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const getCities = require("../controllers/getCities");
const orderRoutes = require("./orderRoutes");
const categoryRoutes = require("./categoryRoutes");
const paymentRoutes = require("./paymentRoutes");
const notificationRoutes = require("./notificationRoutes");
const { verifyToken } = require("../utils/tokenGenerator");
const router = express.Router();

// For user signup and login
router.use("/user", userAuthRoutes);

// verify token
router.use(verifyToken);

// product CURD functionality
router.use("/product", productRoutes);

// cart routes
router.use("/cart", cartRoutes);

// get cities
router.get("/cities", getCities);

// category routes
router.use("/category", categoryRoutes);

// order routes
router.use("/order", orderRoutes);

// payment routes
router.use("/payment", paymentRoutes);

router.use("/notifications", notificationRoutes);

module.exports = router;
