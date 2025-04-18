const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Roles = require("../utils/roles");
const Order = require("../models/Order");

const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching user details",
    });
    console.error(error);
  }
};

const getCart = async (req, res) => {
  const { id } = req.user;
  const { limit = 10 } = req.query;
  try {
    const user = await User.findById(id)
      .select("cart")
      .populate("cart.productId")
      .lean();

    let remove = [];
    const userCart = user.cart.filter((item) => {
      if (item.productId === null) remove.push(item._id);
      return item.productId !== null;
    });

    user.cart = userCart.map((item) => {
      item.free_quantity =
        Math.floor(item.quantity / item.productId?.scheme_quantity) *
        item.productId?.free_quantity;
      return item;
    });

    if (remove.length > 0) {
      await User.findByIdAndUpdate(id, {
        $pull: { cart: { _id: { $in: remove } } },
      });
    }
    const uses = [
      ...new Set(user.cart?.map((product) => product.productId?.Uses).flat()),
    ];
    const composition = [
      ...new Set(
        user.cart?.map((product) => product.productId?.Composition).flat()
      ),
    ];

    const recommendedProducts = await Product.find({
      $or: [
        { Uses: { $in: uses } }, // Match any similar uses
        { Composition: { $in: composition } }, // Match any similar composition
      ],
    })
      .limit(limit)
      .lean();

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    if (user.cart?.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "Cart is empty", cart: [] });
    }
    const total_bag = user.cart.reduce(
      (amount, item) => amount + item.quantity * (item.productId?.mrp || 0),
      0
    );
    const offer_discount = user.cart.reduce(
      (amount, item) =>
        amount + (item.productId?.discount_price || 0) * item.quantity,
      0
    );
    const delivery_charge = 40;
    const subtotal = total_bag - offer_discount;
    const grand_total = subtotal + delivery_charge;
    const free_items = user.cart.reduce(
      (free, item) =>
        Math.floor(item.quantity / item.productId?.scheme_quantity) *
        item.productId?.free_quantity,
      0
    );
    return res.status(200).json({
      success: true,
      cart: user.cart,
      recommendedProducts,
      total_bag,
      offer_discount,
      delivery_charge,
      subtotal,
      grand_total,
      free_items,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching cart details",
    });
  }
};

const getWholesalerRequest = async (req, res) => {
  const { id } = req.user;
  const { limit, pageNumber = 1 } = req.query;
  try {
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(String(id)) } }, // Match the user by ID
      {
        $project: {
          wholesalerRequests: {
            $slice: [
              "$wholesalerRequests",
              parseInt(pageNumber) - 1, // Starting index
              parseInt(limit) || 10, // Number of items to fetch (default 10)
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users", // Reference the User collection
          localField: "wholesalerRequests",
          foreignField: "_id",
          as: "wholesalerRequests",
        },
      },
      {
        $project: {
          wholesalerRequests: {
            $map: {
              input: "$wholesalerRequests",
              as: "request",
              in: {
                _id: "$$request._id",
                shopOrHospitalName: "$$request.shopOrHospitalName",
                dealershipLicenseNumber: "$$request.dealershipLicenseNumber",
                delaershipLicenseImage: "$$request.dealershipLicenseImage",
              },
            },
          },
        },
      },
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      wholesalerRequests: (user.length > 0 && user[0].wholesalerRequests) || [],
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching wholesaler requests",
    });
  }
};

const getRetailerRequest = async (req, res) => {
  const { id } = req.user;
  const { limit, pageNumber = 1 } = req.query;
  try {
    const user = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(String(id)) } }, // Match the user by ID
      {
        $project: {
          retailerRequests: {
            $slice: [
              "$retailerRequests",
              parseInt(pageNumber) - 1, // Starting index
              parseInt(limit) || 10, // Number of items to fetch (default 10)
            ],
          },
        },
      },
      {
        $lookup: {
          from: "users", // Reference the User collection
          localField: "retailerRequests",
          foreignField: "_id",
          as: "retailerRequests",
        },
      },
      {
        $project: {
          retailerRequests: {
            $map: {
              input: "$retailerRequests",
              as: "request",
              in: {
                _id: "$$request._id",
                shopOrHospitalName: "$$request.shopOrHospitalName",
                dealershipLicenseNumber: "$$request.dealershipLicenseNumber",
                delaershipLicenseImage: "$$request.dealershipLicenseImage",
              },
            },
          },
        },
      },
    ]);

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      retailerRequests: (user.length > 0 && user[0].retailerRequests) || [],
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching wholesaler requests",
    });
  }
};
const getRetailers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetching retailers with pagination
    const retailers = await User.find({ role: 2 })
      .select(
        "fullName mobileNumber email shopOrHospitalName dealershipLicenseNumber user_verified mobile_verified location"
      )
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total retailers for pagination metadata
    const totalRetailers = await User.countDocuments({ role: 2 });

    res.status(200).json({
      success: true,
      retailers,
      totalPages: Math.ceil(totalRetailers / limit),
      currentPage: page,
      totalRetailers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};
const getWholesalers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = parseInt(limit);

    // Fetch wholesalers with pagination
    const wholesalers = await User.find({ role: 1 })
      .select(
        "fullName shopOrHospitalName mobileNumber location dealershipLicenseNumber user_verified mobile_verified"
      )
      .skip((page - 1) * limit)
      .limit(limit);

    // Count total wholesalers for pagination metadata
    const totalWholesalers = await User.countDocuments({ role: 1 });

    res.status(200).json({
      success: true,
      wholesalers,
      totalPages: Math.ceil(totalWholesalers / limit),
      currentPage: page,
      totalWholesalers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error });
  }
};

const getDeliveryPartner = async (req, res) => {
  try {
    const deliveryPartner = await User.find({ role: Roles.DELIVERY_PARTNER });

    res.status(200).json({ success: true, partners: deliveryPartner });
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    if (req.user.role === Roles.ADMIN) {
      var totalOrders = await Order.estimatedDocumentCount({});
      var totalSales = await Order.aggregate([
        {
          $group: {
            _id: null,
            order_total_amount: { $sum: "$order_total_amount" },
          },
        },
      ]);
      totalSales = totalSales.length > 0 ? totalSales[0].order_total_amount : 0;
    } else {
      var user = await User.findById(req.user.id).populate("orders");
      var totalOrders = user.orders.length;
      var totalSales = user.orders.reduce(
        (acc, order) => acc + order?.order_total_amount,
        0
      );
    }
    const totalWholesalers = await User.estimatedDocumentCount({
      role: Roles.WHOLESALER,
    });
    const totalRetailers = await User.estimatedDocumentCount({
      role: Roles.RETAILER,
    });
    const totalDeliveryPartners = await User.estimatedDocumentCount({
      role: Roles.DELIVERY_PARTNER,
    });
    const totalProducts = await Product.estimatedDocumentCount({});
    return res.status(200).json({
      success: true,
      totalOrders,
      totalSales,
      totalWholesalers,
      totalRetailers,
      totalDeliveryPartners,
      totalProducts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
const getUsers = async (req, res) => {
  const { limit = 10, page = 1 } = req.query;
  try {
    const users = await User.aggregate([
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      { $project: { fullName: 1, mobileNumber: 1, role: 1 } },
    ]);

    res.status(200).json({
      success: true,
      users,
      totalDocuments: await User.countDocuments(),
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching users",
      error: error.message,
    });
  }
};
module.exports = {
  userDetails,
  getCart,
  getWholesalerRequest,
  getRetailerRequest,
  getRetailers,
  getWholesalers,
  getDeliveryPartner,
  getUserStats,
  getUsers,
};
