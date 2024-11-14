const express = require("express");
const { verifyToken } = require("../utils/tokenGenerator");
const { deleteProductFromCart } = require("../controllers/deleteController");
const { addProductToCart } = require("../controllers/addController");
const { getCart } = require("../controllers/getUserDetails");

const router = express.Router();

router.use(verifyToken);

router.get("", getCart);

router.post("", addProductToCart);

router.delete("", deleteProductFromCart);

module.exports = router;
