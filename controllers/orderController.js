const { default: mongoose } = require("mongoose");
const Notification = require("../models/Nodtification");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");
const { saveAndPushNotification } = require("./notificationController");

const placeOrder = async (req, res) => {
  const { id } = req.user;
  try {
    const cartData = await User.findById(id, { cart: 1 })
      .populate("cart.productId")
      .lean();
    if (!cartData) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    const orderData = req.body;
    orderData.products = cartData.cart;
    orderData.user_id = id;
    orderData.order_status = "in process";
    orderData.order_delivery_charge = 40;
    var order_amount = 0;
    var order_discount = 0;
    const n = cartData.cart.length;
    if (n === 0) {
      return res.status(200).json({ success: false, message: "Cart is empty" });
    }
    let firstProductName;
    for (let i = 0; i < n; i++) {
      const pro = await Product.findById(cartData.cart[i].productId, {
        mrp: 1,
        discount: 1,
        Medicine_Name: 1,
      }).lean();
      if (i === 0) {
        firstProductName = pro.Medicine_Name;
      }
      order_amount += pro.mrp * cartData.cart[i].quantity;
      order_discount +=
        ((pro.mrp * pro.discount) / 100) * cartData.cart[i].quantity;
    }
    orderData.order_amount = Math.round(order_amount, 3);
    orderData.order_discount = Math.round(order_discount, 3);
    orderData.order_total_amount = Math.round(
      order_amount - order_discount + 40,
      3
    );
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
      Notification_body: `Order of ${firstProductName}${
        cartData?.cart?.length - 1 > 0
          ? " + " + (cartData?.cart?.length - 1) + " "
          : " "
      }with order id (#${order._id}) has been placed. `,
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
  const { id, role } = req.user;
  const { page = 1, limit = 10 } = req.query;
  try {
    if (role === Roles.ADMIN) {
      let orders = await Order.aggregate([
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_id",
          },
        },
      ]);
      // Step 2: Collect all productIds
      const productIds = [];
      orders.forEach((order) => {
        orders.user_id = order.user_id[0];
        order.products.forEach((p) => productIds.push(p.productId));
      });

      // Step 3: Fetch all products in one go
      const allProducts = await Product.find({
        _id: { $in: productIds },
      }).lean();
      const productMap = new Map(allProducts.map((p) => [p._id.toString(), p]));

      // Step 4: Map product data back into each order
      orders = orders.map((order) => {
        order.products = order.products.map((p) => ({
          ...p,
          productId: productMap.get(p.productId.toString()) || null,
        }));
        return order;
      });
      // orders = orders.map((order) => {
      //   order.user_id = order.user_id[0];
      // });
      const totalOrdersCount = await Order.estimatedDocumentCount({});
      return res.status(200).json({
        success: true,
        orders,
        totalOrdersCount,
      });
    } else {
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
              path: "user_id",
              model: "User",
            },
          ],
          options: {
            limit: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
          },
        });

      const result = await User.findById(id, { orders: 1 });

      const totalOrdersCount = result?.orders?.length || 0;

      return res.status(200).json({
        success: true,
        orders: user?.orders || [],
        totalOrdersCount,
      });
    }
  } catch (error) {
    console.log(error);
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
    const firstProduct = await Product.findById(order.products[0].productId, {
      Medicine_Name: 1,
    }).lean();

    if (order) {
      const notification = new Notification({
        user_id: order.user_id,
        Notification_title: "Order status Update",
        Notification_body: `Your order of ${firstProduct.Medicine_Name}${
          order?.products?.length - 1 > 0
            ? " + " + (order?.products?.length - 1) + " "
            : " "
        }with order id of (#${order_id}) status has been updated to '${
          req.body?.order_status
        }'`,
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
    const order = await Order.findById(order_id).populate("user_id");
    if (!order) {
      return res
        .status(200)
        .json({ success: false, message: "Order not found" });
    }
    if (!order.assigned || order.assigned === "") {
      var assignOrder = await User.findByIdAndUpdate(
        deliveryPartner,
        { $push: { orders: order_id } },
        { new: true }
      );
      order.assigned = deliveryPartner;
      order.order_status = "Assigned";
      await order.save();
    }
    if (assignOrder) {
      const firstProduct = await Product.findById(order.products[0].productId, {
        Medicine_Name: 1,
      }).lean();

      saveAndPushNotification(
        deliveryPartner,
        "New order assigned",
        `Your have been assigned to a new order of ${
          firstProduct.Medicine_Name
        }${
          order?.products?.length - 1 > 0
            ? " + " + (order?.products?.length - 1) + " "
            : ""
        }with order id of (#${order_id})`
      );

      return res.status(200).json({
        success: true,
        message: "Order assigned to delivery partner",
        order,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Order already assigned to delivery partner",
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
      saveAndPushNotification(
        id,
        "Order Status Update",
        `Your order (#${order_id}) has been cancelled`
      );
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

const placeInCart = async (req, res) => {
  const { id } = req.user;
  const { order_id } = req.body;
  try {
    const order = await Order.findById(order_id).select("products");
    console.log(order.products);
    const user = await User.findByIdAndUpdate(
      id,
      { cart: order.products },
      { new: true }
    );
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Order placed in cart successfully" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
const getRefundOrders = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findById(id).populate("refundOrders");
    res.status(200).json({ success: true, orders: user?.refundOrders || [] });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

const updateDeliveryStatus = async (req, res) => {
  const { order_id, otp } = req.body;
  try {
    const order = await Order.findById(order_id, { order_otp: 1 });
    if (!order) {
      return res
        .status(200)
        .json({ success: false, message: "Order not found" });
    }
    if (order.order_otp === otp) {
      await Order.findByIdAndUpdate(order_id, { order_status: "delivered" });
      return res
        .status(200)
        .json({ success: true, message: "Order delivered successfully" });
    }
    return res.status(200).json({ success: false, message: "Invalid OTP" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

const searchOrders = async (req, res) => {
  const { id } = req.user;
  const { searchQuery } = req.body;
  try {
    const orders = await Order.find({
      user_id: id,
      order_status: { $regex: searchQuery, $options: "i" },
    });
    res.status(200).json({ success: true, orders });
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
  placeInCart,
  getRefundOrders,
  updateDeliveryStatus,
  searchOrders,
};
