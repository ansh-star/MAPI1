const Admin = require("../models/Admin");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");

const getProducts = async (req, res) => {
  // Extract user ID and role from the authenticated user's request
  const { id: userid, role } = req.user;

  // Extract pagination parameters from the request body
  const { pageNumber, limit } = req.query;
  try {
    // Check if the user role is ADMIN
    if (role === Roles.ADMIN) {
      // Fetch the admin
      const admin = await Admin.findOne({ _id: userid });

      // If the admin is not found, return an error
      if (!admin) {
        return res
          .status(200)
          .json({ success: false, message: "Admin not found" });
      }

      // Step 1: Shuffle all products with a large sample size (here, 100).
      const products = await Product.aggregate([
        { $sample: { size: parseInt(limit) } }, // Randomly sample 'limit' number of products
      ]);

      // Respond with the products found
      return res.status(200).json({ success: true, products });
    }
    // Check if the user role is WHOLESALER
    const user = await User.findOne({ _id: userid });

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    if (role === Roles.WHOLESALER) {
      // Fetch user and their products with pagination for WHOLESALER
      const products = await User.findOne({ _id: userid }).populate({
        path: "products", // Specify the path to populate
        options: {
          limit: parseInt(limit),
          skip: ((parseInt(pageNumber) || 1) - 1) * 10,
        },
      });
      // If the user is not found, return an error
      if (!products) {
        return res
          .status(200)
          .json({ success: false, message: "User not found" });
      }
      // Respond with the user and their products
      return res.status(200).json({ success: true, products });
    } else {
      const products = await Product.aggregate([
        { $sample: { size: parseInt(limit) } }, // Randomly sample 'limit' number of products
      ]);
      return res.status(200).json({ success: true, products });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts };
