const Notification = require("../models/Nodtification");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");

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
    if (n === 0) {
      return res.status(200).json({ success: false, message: "Cart is empty" });
    }
    for (let i = 0; i < n; i++) {
      const pro = await Product.findById(cartData.cart[i].productId, {
        mrp: 1,
        discount: 1,
      }).lean();

      order_amount += pro.mrp * cartData.cart[i].quantity;
      order_discount +=
        ((pro.mrp * pro.discount) / 100) * cartData.cart[i].quantity;
    }
    orderData.order_amount = order_amount;
    orderData.order_discount = order_discount;
    orderData.order_total_amount = order_amount - order_discount + 40;
    orderData.order_payment_status = "unpaid";
    orderData.order_payment_method = "UPI";
    if (req.body.order_payment_id) {
      orderData.order_payment_status = req.body.order_payment_status;
    }
    const order = new Order(orderData);
    const savedOrder = await order.save();
    const user = await User.findByIdAndUpdate(
      id,
      {
        $set: { cart: [] }, // Clear the cart
        $push: { orders: savedOrder._id }, // Push the order ID into the orders array
      },
      { new: true } // Return the updated document
    );
    const notification = new Notification({
      user_id: id,
      Notification_title: "Order Placed",
      Notification_body: `Your order (#${order._id}) has been placed`,
      Date: Date.now(),
    });
    await notification.save();
    await User.findByIdAndUpdate(id, {
      $push: { notifications: notification._id },
    });
    await User.updateMany(
      { role: Roles.ADMIN },
      { $push: { notifications: notification._id } }
    );
    res.status(200).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id)
      .select("orders")
      .populate({
        path: "orders",
        populate: [
          {
            path: "products.productId",
            model: "Product",
          },
          {
            path: "address",
            model: "Address",
          },
        ],
      });
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
    if (order) {
      const notification = new Notification({
        user_id: order.user_id,
        Notification_title: "Order status Update",
        Notification_body: `Your order (#${order_id}) status has been updated to '${req.body?.order_status}'`,
      });

      await notification.save();

      await User.findByIdAndUpdate(order.user_id, {
        $push: { notifications: notification._id },
      });

      return res
        .status(200)
        .json({ success: true, message: "Order Updated successfully" });
    }
    return res
      .status(200)
      .json({ success: false, message: "Order with this id does not exist" });
  } catch (error) {
    return res.status(200).json({ success: false, message: error.message });
  }
};

const assignToDeliveryPartner = async (req, res) => {
  const { deliveryPartner, order_id } = req.body;
  try {
    const order = await Order.findById(order_id);
    console.log(order);
    if (!order.assigned || order.assigned === "") {
      var assignOrder = await User.findByIdAndUpdate(
        deliveryPartner,
        { $push: { orders: order_id } },
        { new: true }
      );
      order.assigned = deliveryPartner;
      await order.save();
    }
    if (assignOrder) {
      const notification = new Notification({
        user_id: deliveryPartner,
        Notification_title: "New order assigned",
        Notification_body: `Your have been assigned to a new order (#${order_id})`,
      });

      await notification.save();

      await User.findByIdAndUpdate(deliveryPartner, {
        $push: { notifications: notification._id },
      });

      return res
        .status(200)
        .json({ success: true, message: "Order assigned to delivery partner" });
    }
    return res.status(200).json({
      success: false,
      message: "Order not assigned to delivery partner",
    });
  } catch (error) {
    return res.status(200).json({ success: false, message: error.message });
  }
};
const cancelOrder = async (req, res) => {
  const { id } = req.user;
  const { order_id } = req.body;
  try {
    const order = await User.find({ _id: id, orders: order_id });
    if (order) {
      await Order.findByIdAndUpdate(order_id, {
        order_status: "cancelled",
      });
      const notification = new Notification({
        user_id: id,
        Notification_title: "Order Status Update",
        Notification_body: `Your order (#${order_id}) has been cancelled`,
      });
      await notification.save();
      await User.findByIdAndUpdate(id, {
        $push: { notifications: notification._id },
      });
      return res
        .status(200)
        .json({ success: true, message: "Order cancelled successfully" });
    }
    res
      .status(200)
      .json({ success: false, message: "This user cannot cancel this order" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
module.exports = {
  placeOrder,
  getOrders,
  updateOrder,
  assignToDeliveryPartner,
  cancelOrder,
};
