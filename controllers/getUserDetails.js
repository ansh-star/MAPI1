const { default: mongoose } = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");

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

module.exports = {
  userDetails,
  getCart,
  getWholesalerRequest,
  getRetailerRequest,
};
