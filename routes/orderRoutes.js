const express = require("express");
const {
  placeOrder,
  getOrders,
  updateOrder,
  assignToDeliveryPartner,
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

module.exports = router;
