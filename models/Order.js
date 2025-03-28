const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  order_date: {
    type: Date,
    required: true,
    default: function () {
      const now = new Date();
      now.setSeconds(0, 0);
      return now;
    },
  },
  order_status: { type: String, required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],
  order_amount: { type: Number, required: true, default: 0 },
  order_discount: { type: Number, required: true, default: 0 },
  order_delivery_charge: { type: Number, required: true, default: 40 },
  order_batch_no: { type: String },
  order_total_amount: { type: Number, required: true },
  address: { type: Schema.Types.ObjectId, required: true, ref: "Address" },
  order_payment_id: {
    type: Schema.Types.ObjectId,
    ref: "Payment",
  },
  order_payment_status: { type: String },
  order_payment_method: { type: String },
  assigned: { type: Schema.Types.ObjectId, ref: "User" },
  delivery_date: { type: Date },
  order_otp: { type: String, default: getRandomInt(4) },
});

function getRandomInt(n) {
  let ans = "";
  for (let i = 0; i < n; i++) {
    let num = Math.floor(Math.random() * 10);
    ans = ans.concat(num.toString());
  }
  return ans;
}

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
