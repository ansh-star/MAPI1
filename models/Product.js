const { default: mongoose } = require("mongoose");

const productSchema = new mongoose.Schema({
  Product_id: { type: String },
  Medicine_Name: { type: String, required: true },
  Manufacturer: { type: String },
  Composition: { type: String },
  type: { type: String },
  Information: { type: String },
  Key_Benefits: { type: String },
  description: { type: String },
  Directions_for_Use: { type: String },
  safety_advise: { type: String },
  if_miss: { type: String },
  Packaging_Detail: { type: String },
  Package: { type: String },
  Qty: { type: String },
  Product_Form: { type: String },
  mrp: { type: Number },
  prescription_required: { type: String },
  Fact_Box: { type: String },
  Uses: { type: String },
  storage: { type: String },
  use_of: { type: String },
  Side_effects: { type: String },
  alcoholInteraction: { type: String },
  pregnancyInteraction: { type: String },
  lactationInteraction: { type: String },
  drivingInteraction: { type: String },
  kidneyInteraction: { type: String },
  liverInteraction: { type: String },
  MANUFACTURER_ADDRESS: { type: String },
  Q_A: { type: String },
  How_it_works: { type: String },
  Interaction: { type: String },
  Manufacturer_details: { type: String },
  Marketer_details: { type: String },
  Reference: { type: String },
  Image_URLS: { type: [String] },
  location: { type: String },
  Expiry_Date: { type: Date },
  min_quantity: { type: Number, default: 4 },
  scheme_quantity: { type: Number, default: 10 },
  free_quantity: { type: Number, default: 1 },
  total_stock: { type: Number, default: 10 },
  discount: { type: Number, default: 20 },
  sale_price: {
    type: Number,
  },
  discount_price: {
    type: Number,
  },
});

productSchema.pre("save", function (next) {
  if (this.isModified("mrp") || this.isModified("discount")) {
    this.discount_price = (this.mrp * this.discount) / 100;
    this.sale_price = this.mrp - this.discount_price;
  }
  next();
});

productSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
  const update = this.getUpdate();
  const mrp = update?.mrp;
  const discount = update?.discount;
  if (mrp && discount) {
    update.discount_price = (mrp * discount) / 100;
    update.sale_price = mrp - update.discount_price;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
