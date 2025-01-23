const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  order_date: { type: Date, required: true },
  order_status: { type: String, required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],
  order_amount: { type: Number, required: true },
  order_discount: { type: Number, required: true },
  order_delivery_charge: { type: Number, required: true },
  order_batch_no: { type: String },
  order_total_amount: { type: Number, required: true },
  address: { type: Schema.Types.ObjectId, required: true, ref: "Address" },
  order_payment_id: { type: String },
  order_payment_status: { type: String, required: true },
  order_payment_method: { type: String, required: true },
  assigned: { type: Schema.Types.ObjectId, ref: "user" },
  delivery_date: { type: Date },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
