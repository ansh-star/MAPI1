const express = require("express");
const {
  deleteProductFromCart,
  clearCart,
} = require("../controllers/deleteController");
const { addProductToCart } = require("../controllers/addController");
const { getCart } = require("../controllers/getUserDetails");

const router = express.Router();

router.get("", getCart);

router.post("", addProductToCart);

router.delete("", deleteProductFromCart);

router.delete("/clear", clearCart);

module.exports = router;
