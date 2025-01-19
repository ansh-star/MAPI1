const Order = require("../models/Order");
const User = require("../models/User");

const placeOrder = async (req, res) => {
  const { id } = req.user;
  try {
    const order = new Order({ ...req.body });
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
    res.status(200).json({ success: true, orders: user.orders });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = { placeOrder, getOrders };
