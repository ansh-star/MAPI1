const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");

const getExpiryItems = async (req, res) => {
  const { id } = req.user;
  try {
    const orders = await User.findById(id, { orders: 1 }).populate({
      path: "orders",
      populate: {
        path: "products.productId", // Ensure the correct path inside orders
      },
    });
    const products = [];
    orders.orders.forEach((order) => {
      order.products.forEach((product) => {
        if (
          product.productId.Expiry_Date - Date.now() <
          2 * 30 * 24 * 60 * 60 * 1000
        ) {
          products.push(product);
        }
      });
    });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(200).json({ success: true, message: error.message });
  }
};

const replaceRefundExpiredItems = async (req, res) => {
  const { id } = req.user; // User ID
  const { products, replacingOrder, address } = req.body; // Products array & return type

  try {
    let populateProducts = [];
    let n = products.length;
    for (let i = 0; i < n; i++) {
      const pro = await Product.findById(products[i].productId);
      populateProducts.push({ productId: pro, quantity: products[i].quantity });
    }
    if (replacingOrder) {
      // Create a new order with status "Returning"
      var order = new Order({
        user_id: id,
        products: populateProducts,
        order_status: "Replacing",
        order_total_amount: 100,
        address,
      });

      await order.save();

      await User.updateMany({ role: Roles.ADMIN }, { orders: order._id });

      res.status(200).json({
        success: true,
        message: "Item is being returned",
        replaceOrder: order,
      });
    } else {
      // Calculate refund amount (90% of total product price)
      const refundAmount =
        populateProducts.reduce(
          (total, product) =>
            total +
            parseInt(product.productId?.mrp) * parseInt(product.quantity),
          0
        ) * 0.9;
      // Create a new order with status "Refunded"
      var order = new Order({
        user_id: id,
        products: populateProducts,
        order_status: "Refunded",
        order_total_amount: refundAmount, // Store refund amount in order
        address,
      });

      await order.save();

      await User.updateMany({ role: Roles.ADMIN }, { refundOrders: order._id });

      res.status(200).json({
        success: true,
        message: `Refund of ₹${refundAmount} has been processed successfully`,
        refundOrder: order,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getExpiryItems, replaceRefundExpiredItems };
