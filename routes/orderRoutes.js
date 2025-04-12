const express = require("express");
const {
  placeOrder,
  getOrders,
  updateOrder,
  assignToDeliveryPartner,
  cancelOrder,
  placeInCart,
  getRefundOrders,
  updateDeliveryStatus,
  searchOrders,
} = require("../controllers/orderController");
const {
  verifyDeliveryPartner,
  verifyAdmin,
} = require("../utils/tokenGenerator");
const {
  getExpiryItems,
  replaceRefundExpiredItems,
} = require("../controllers/expiryController");

const router = express.Router();

router.post("", placeOrder);

router.get("", getOrders);

router.get("/search", searchOrders);

router.put("", verifyDeliveryPartner, updateOrder);

router.post("/assign", verifyAdmin, assignToDeliveryPartner);

router.put("/cancel", cancelOrder);

router.post("/re-order", placeInCart);

router.get("/expire-items", getExpiryItems);

router.post("/return-refund-expired-items", replaceRefundExpiredItems);

router.get("/refund-order", getRefundOrders);

router.put("/delivery-status", updateDeliveryStatus);

module.exports = router;
