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
    if (role !== Roles.WHOLESALER) {
      const totalDocuments = await Product.countDocuments({});
      const randomSkip = Math.floor(Math.random() * (totalDocuments - 1000)); // Skip a random number of documents before selecting 1000 consecutive

      const products = await Product.aggregate([
        { $skip: randomSkip },
        { $limit: 1000 },
        { $sample: { size: 100 } },
      ]);

      // Respond with the products found
      return res.status(200).json({ success: true, products });
    }
    // Fetch user and their products with pagination for WHOLESALER
    const user = await User.findOne({ _id: userid }).populate({
      path: "products", // Specify the path to populate
      options: {
        limit: parseInt(limit),
        skip: ((parseInt(pageNumber) || 1) - 1) * 10,
      },
    });
    // If the user is not found, return an error
    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }
    // Respond with the user and their products
    return res.status(200).json({ success: true, products: user.products });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ success: false, message: error.message });
  }
};

module.exports = { getProducts };
