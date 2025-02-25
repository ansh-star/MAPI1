const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  shopOrHospitalName: { type: String }, // For Wholeseller and Retailer
  mobileNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  email: { type: String },
  dealershipLicenseNumber: { type: String }, // For Wholeseller and Retailer
  dealershipLicenseImage: { type: [String] }, // For Wholeseller and Retailer

  // Products for Wholeseller and Retailer
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product", // Refers to the Product schema
    },
  ],

  // Cart for Wholeseller and Retailer
  cart: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number },
    },
  ],

  // Address List
  addressList: [
    {
      type: Schema.Types.ObjectId,
      ref: "Address",
    },
  ],
  wholesalerRequests: [
    // Separate array for Wholesalers
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  retailerRequests: [
    // Separate array for Wholesalers
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // User verification status
  user_verified: { type: Boolean, default: false },
  mobile_verified: { type: Boolean, default: false },
  // Role field: 0 for Wholeseller, 1 for Retailer, 2 for Delivery Partner
  role: { type: Number, required: true, enum: [0, 1, 2, 3] },
  notifications: [{ type: Schema.Types.ObjectId, ref: "Notification" }],
  orders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  refundOrders: [
    {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  expiredOrders: [String],
});

module.exports = mongoose.model("User", userSchema);
