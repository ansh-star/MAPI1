const Product = require("../models/Product");

const searchProducts = async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;

  // Build a dynamic query object with an OR condition to match any of the fields
  const query = {};

  if (search) {
    query.$or = [
      { Medicine_Name: new RegExp(search, "i") }, // Matches medicine name containing search
      { Manufacturer: new RegExp(search, "i") }, // Matches manufacturer name containing search
      { Composition: new RegExp(search, "i") }, // Matches composition containing search
    ];
  }

  try {
    const skip = (page - 1) * limit;

    const products = await Product.find(query).skip(skip).limit(limit).lean();

    // get distinct uses and composition from the products
    const uses = [...new Set(products?.map((product) => product?.Uses).flat())];
    const composition = [
      ...new Set(products?.map((product) => product?.Composition).flat()),
    ];

    const recommendedProducts = await Product.find({
      $or: [
        { Uses: { $in: uses } }, // Match any similar uses
        { Composition: { $in: composition } }, // Match any similar composition
      ],
    })
      .limit(limit)
      .lean();

    const total = recommendedProducts.length;

    // If no products match the search, return a status message and an empty array
    if (total === 0) {
      return res.status(200).json({
        success: false,
        message: "No products match your search",
        products: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
      });
    }

    res.json({
      success: true,
      message: "Products matching your search retrieved successfully",
      products: recommendedProducts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
};

const recommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // Find the target product to base recommendations on
    const targetProduct = await Product.findById(productId);
    if (!targetProduct)
      return res
        .status(200)
        .json({ success: false, message: "Product not found" });

    // Find similar products by matching uses and composition
    const recommendedProducts = await Product.find({
      _id: { $ne: productId },
      $or: [
        { Uses: { $in: [targetProduct.Uses] } }, // Match any similar uses
        { Composition: { $in: [targetProduct.Composition] } }, // Match any similar composition
      ],
    });

    // Send back the recommended products
    res
      .status(200)
      .json({ recommendedProducts, product: targetProduct, success: true });
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  searchProducts,
  recommendedProducts,
};
