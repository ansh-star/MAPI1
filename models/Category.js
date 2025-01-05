const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  category_name: { type: String, required: true },
  category_slug: { type: String, required: true },
  category_icon: { type: String, required: true },
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
