const express = require("express");
const userAuthRoutes = require("./userAuthRoutes");
const productRoutes = require("./productRoutes");
const cartRoutes = require("./cartRoutes");
const getCities = require("../controllers/getCities");
const categoryRoutes = require("./categoryRoutes");
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

module.exports = router;
