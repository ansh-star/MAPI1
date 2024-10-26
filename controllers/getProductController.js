const Admin = require("../models/Admin");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");

const getProducts = async (req, res) => {
  // Extract user ID and role from the authenticated user's request
  const { id: userid, role } = req.user;

  // Extract pagination parameters from the request body
  const { pageNumber, limit } = req.body;

  try {
    // Check if the user role is ADMIN
    if (role === Roles.ADMIN) {
      // Fetch the admin
      const admin = await Admin.findOne({ _id: userid });

      // If the admin is not found, return an error
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found" });
      }

      // Fetch products with pagination for ADMIN
      const products = await Product.aggregate([
        { $skip: ((pageNumber || 1) - 1) * 10 },
        { $limit: limit },
      ]);
      // Respond with the products found
      return res.status(200).json({ success: true, products });
    }
    // Check if the user role is WHOLESALER
    else if (role === Roles.WHOLESALER) {
      // Fetch user and their products with pagination for WHOLESALER
      const products = await User.findOne({ _id: userid }).populate({
        path: "products", // Specify the path to populate
        options: {
          limit: limit,
          skip: ((pageNumber || 1) - 1) * 10,
        },
      });
      // If the user is not found, return an error
      if (!products) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      // Respond with the user and their products
      return res.status(200).json({ success: true, user: products });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts };
