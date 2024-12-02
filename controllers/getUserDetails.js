const { default: mongoose } = require("mongoose");
const User = require("../models/User");

const userDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res
        .status(404)
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
  try {
    const user = await User.findById(id)
      .select("cart")
      .populate("cart.productId");
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
    return res.status(200).json({ success: true, cart: user.cart });
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

    res
      .status(200)
      .json({ success: true, wholesalerRequests: user[0].wholesalerRequests });
  } catch (error) {
    console.error(error);
    res.status(200).json({
      success: false,
      message: "Error occurred while fetching wholesaler requests",
    });
  }
};

module.exports = { userDetails, getCart, getWholesalerRequest };
