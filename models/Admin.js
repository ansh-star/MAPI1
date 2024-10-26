const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobileNumber: {
    type: String, // Changed to String to handle different formats
    required: true,
    unique: true,
  },
  location: {
    type: String,
    required: true,
  },
  adminKey: {
    type: String,
    required: true, // This key will differentiate an Admin user
    unique: true,
  },
  wholesalerRequests: [
    // Separate array for Wholesalers
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  productList: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
