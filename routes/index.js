const express = require("express");
const userAuthRoutes = require("./userAuthRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const getCities = require("../controllers/getCities");
const orderRoutes = require("./orderRoutes");
const categoryRoutes = require("./categoryRoutes");
const paymentRoutes = require("./paymentRoutes");
const notificationRoutes = require("./notificationRoutes");
const { verifyToken, verifyAdmin } = require("../utils/tokenGenerator");
const { getDeliveryPartner } = require("../controllers/getUserDetails");
const router = express.Router();

// For user signup and login
router.use("/user", userAuthRoutes);

// get cities
router.get("/cities", getCities);

// verify token
router.use(verifyToken);

// product CURD functionality
router.use("/product", productRoutes);

// cart routes
router.use("/cart", cartRoutes);

// category routes
router.use("/category", categoryRoutes);

// order routes
router.use("/order", orderRoutes);

// payment routes
router.use("/payment", paymentRoutes);

//notification routes
router.use("/notifications", notificationRoutes);

// get delivery partners
router.get("/delivery-partners", verifyAdmin, getDeliveryPartner);

module.exports = router;
