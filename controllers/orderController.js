const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");

const placeOrder = async (req, res) => {
  const { id } = req.user;
  try {
    const cartData = await User.findById(id, { cart: 1 })
      .populate("cart.productId")
      .lean();
    const orderData = req.body;
    orderData.products = cartData.cart;
    orderData.user_id = id;
    orderData.order_date = Date.now();
    orderData.order_status = "in process";
    orderData.order_delivery_charge = 40;
    var order_amount = 0;
    var order_discount = 0;
    const n = cartData.cart.length;
    for (let i = 0; i < n; i++) {
      const pro = await Product.findById(cartData.cart[i].productId, {
        mrp: 1,
        discount: 1,
      }).lean();

      order_amount += pro.mrp * cartData.cart[i].quantity;
      order_discount +=
        ((pro.mrp * (100 - pro.discount)) / 100) * cartData.cart[i].quantity;
    }
    orderData.order_amount = Math.round(order_amount * 100) / 100;
    orderData.order_discount = Math.round(order_discount * 100) / 100;
    orderData.order_total_amount =
      Math.round((order_amount - order_discount) * 100) / 100;
    orderData.order_payment_status = "unpaid";
    orderData.order_payment_method = "UPI";
    if (req.body.order_payment_id) {
      orderData.order_payment_status = req.body.order_payment_status;
    }
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

const updateOrder = async (req, res) => {
  const { order_id } = req.body;
  try {
    req.body.order_id = undefined;
    const order = await Order.findByIdAndUpdate(
      order_id,
      { ...req.body },
      { new: true }
    );
    return res
      .status(200)
      .json({ success: true, message: "Order Updated successfully" });
  } catch (error) {
    return res.status(200).json({ success: false, message: error.message });
  }
};

const assignToDeliveryPartner = async (req, res) => {
  const { deliveryPartner, order_id } = req.body;
  try {
    const order = await Order.findById(order_id);
    if (order.assigned !== "") {
      var assignOrder = await User.findByIdAndUpdate(
        deliveryPartner,
        { $push: { orders: order_id } },
        { new: true }
      );
      order.assigned = deliveryPartner;
      await order.save();
    }
    if (assignOrder) {
      return res
        .status(200)
        .json({ success: true, message: "Order assigned to delivery partner" });
    }
    return res.status(200).json({
      success: false,
      message: "Order not assigned to delivery partner",
    });
  } catch {
    return res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = {
  placeOrder,
  getOrders,
  updateOrder,
  assignToDeliveryPartner,
};
