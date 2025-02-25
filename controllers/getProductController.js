const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");

const getProducts = async (req, res) => {
  // Extract pagination parameters from the request body
  const { page = 1, limit = 100, sort } = req.query;
  try {
    const totalDocuments = await Product.estimatedDocumentCount({});
    // const randomSkip = Math.floor(Math.random() * (totalDocuments - 1000)); // Skip a random number of documents before selecting 1000 consecutive
    // { $match: { $expr: { $gt: [{ $size: "$Image_URLS" }, 0] } } },
    // { $sample: { size: parseInt(limit) } },
    let query = [
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];
    if (Object.keys(req.body).length !== 0) {
      query.push({ $project: req.body });
    }

    const products = await Product.aggregate(query);

    if (sort) {
      if (sort === "price_low_to_high") {
        products.sort((a, b) => a.mrp - b.mrp);
      } else if (sort === "price_high_to_low") {
        products.sort((a, b) => b.mrp - a.mrp);
      }
    }

    // Respond with the products found
    return res.status(200).json({
      success: true,
      products,
      totalDocuments,
      page,
      totalPage: Math.ceil(totalDocuments / limit),
    });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ success: false, message: error.message });
  }
};

const getProduct = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await Product.findById(productId).lean();
    if (!product) {
      return res
        .status(200)
        .json({ success: false, message: "Product not found" });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    console.error(error.message);
    return res.status(200).json({ success: false, message: error.message });
  }
};

const getMyProducts = async (req, res) => {
  const { id } = req.user;

  const { t } = req.query;
  try {
    // Fetch user and their products with pagination for WHOLESALER
    const user = await User.findOne({
      _id: id,
    }).populate({
      path: "products", // Specify the path to populate
      options: {
        skip: ((parseInt(pageNumber) || 1) - 1) * 10,
        limit: parseInt(limit),
      },
      select: { ...req.body },
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
    console.log(error);
    return res.status(200).json({ success: false, message: error.message });
  }
};
module.exports = { getProducts, getProduct, getMyProducts };
