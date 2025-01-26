const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  transactionId: String,
  paymentStatus: String,
  updatedAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
