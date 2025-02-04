const express = require("express");
const {
  placeOrder,
  getOrders,
  updateOrder,
  assignToDeliveryPartner,
  cancelOrder,
  placeInCart,
} = require("../controllers/orderController");
const {
  verifyDeliveryPartner,
  verifyAdmin,
} = require("../utils/tokenGenerator");

const router = express.Router();

router.post("", placeOrder);

router.get("", getOrders);

router.put("", verifyDeliveryPartner, updateOrder);

router.post("/assign", verifyAdmin, assignToDeliveryPartner);

router.put("/cancel", cancelOrder);

router.post("/re-order", placeInCart);

module.exports = router;
