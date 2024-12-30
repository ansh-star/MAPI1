const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  isDefault: { type: Boolean, default: false, required: true },
  label: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  address: { type: String, required: true },
  landmark: { type: String, required: true },
  pincode: { type: String, required: true },
  area: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
});

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
