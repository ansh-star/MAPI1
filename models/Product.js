const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  Medicine_Name: {
    type: String,
    required: true, // This field is mandatory
  },
  Composition: {
    type: String,
    required: true,
  },
  Uses: {
    type: String,
    required: true,
  },
  Side_effects: {
    type: String,
    required: true,
  },
  Image_URL: {
    type: String,
    required: false, //
  },
  Manufacturer: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Product", productSchema);
