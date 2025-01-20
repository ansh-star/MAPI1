const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const placeOrder = async (req, res) => {
  const { id } = req.user;
  try {
    const orderData = req.body;
    orderData.user_id = id;
    orderData.order_date = Date.now();
    orderData.order_status = "in process";
    orderData.order_delivery_charge = 40;
    var order_amount = 0;
    var order_discount = 0;
    const n = orderData.products.length;
    for (let i = 0; i < n; i++) {
      const pro = await Product.findById(orderData.products[i].product, {
        mrp: 1,
        discount: 1,
      }).lean();

      order_amount += pro.mrp * orderData.products[i].quantity;
      order_discount +=
        ((pro.mrp * (100 - pro.discount)) / 100) *
        orderData.products[i].quantity;
    }
    orderData.order_amount = Math.round(order_amount * 100) / 100;
    orderData.order_discount = Math.round(order_discount * 100) / 100;
    orderData.order_total_amount =
      Math.round((order_amount - order_discount) * 100) / 100;
    orderData.order_payment_status = "unpaid";
    orderData.order_payment_method = "UPI";
    const order = new Order(orderData);
    const savedOrder = await order.save();
    const user = await User.findByIdAndUpdate(
      id,
      { $push: { orders: savedOrder._id } },
      { new: true }
    );
    res.status(200).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id).populate("orders");
    res.status(200).json({ success: true, orders: user?.orders || [] });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { placeOrder, getOrders };
