const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  isDefault: { type: Boolean, default: false },
  label: { type: String },
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
  address: { type: String },
  landmark: { type: String },
  pincode: { type: String },
  area: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
