const express = require("express");
const {
  makePayment,
  paymentStatus,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/pay", makePayment);

router.post("/status", paymentStatus);

module.exports = router;
