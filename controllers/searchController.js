const Product = require("../models/Product");
const User = require("../models/User");

const searchProducts = async (req, res) => {
  const { search, page = 1, limit = 50, sort } = req.query;

  let query = {};
  if (search) {
    query = { $text: { $search: search } }; // Use text search with the indexed fields
  }

  try {
    const skip = (page - 1) * limit;

    // Execute the search and aggregation in parallel
    const [products, usesAndComposition] = await Promise.all([
      Product.find(query).skip(skip).limit(limit).lean(),
      Product.aggregate([
        { $match: query }, // Match the search query
        {
          $group: {
            _id: null,
            distinctUses: { $addToSet: "$Uses" },
            distinctComposition: { $addToSet: "$Composition" },
          },
        },
      ]),
    ]);

    // Extract distinct uses and composition
    const uses = usesAndComposition[0]?.distinctUses || [];
    const composition = usesAndComposition[0]?.distinctComposition || [];

    // Find recommended products
    const recommendedProducts = await Product.find({
      $or: [
        { Uses: { $in: uses } }, // Match any similar uses
        { Composition: { $in: composition } }, // Match any similar composition
      ],
    })
      .limit(limit)
      .lean();

    const total = recommendedProducts.length;

    if (sort) {
      if (sort === "price_low_to_high") {
        products.sort((a, b) => a.mrp - b.mrp);
      } else if (sort === "price_high_to_low") {
        products.sort((a, b) => a.mrp - b.mrp).reverse();
      }
    }

    // If no products match the search, return a status message and an empty array
    if (products.length === 0 && total === 0) {
      return res.status(200).json({
        success: false,
        message: "No products match your search",
        products: [],
        recommendedProducts: [],
        total: 0,
        page: parseInt(page),
        totalPages: 0,
      });
    }

    // Return the search results
    res.json({
      success: true,
      message: "Products matching your search retrieved successfully",
      products,
      recommendedProducts,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(200).json({
      success: false,
      message: "Server Error",
      products: [],
      recommendedProducts: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
};

const recommendedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 10, sort } = req.query;

    // Use projection to fetch only necessary fields
    const targetProduct = await Product.findById(productId).lean();
    if (!targetProduct)
      return res
        .status(200)
        .json({ success: false, message: "Product not found" });

    // Dynamically build the $or condition based on available data
    const orConditions = [];
    if (targetProduct.Uses?.length) {
      orConditions.push({ Uses: { $in: targetProduct.Uses } }); // Use the index on 'Uses'
    }
    if (targetProduct.Composition?.length) {
      orConditions.push({ Composition: { $in: targetProduct.Composition } }); // Use the index on 'Composition'
    }

    // Skip querying if no conditions are present
    if (orConditions.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No recommendations found",
        recommendedProducts: [],
        product: targetProduct,
      });
    }

    // Query for recommended products
    const recommendedProducts = await Product.find({
      _id: { $ne: productId },
      $or: orConditions,
    })
      .limit(parseInt(limit))
      .lean();

    if (sort) {
      if (sort === "price_low_to_high") {
        recommendedProducts.sort((a, b) => a.mrp - b.mrp);
      } else if (sort === "price_high_to_low") {
        recommendedProducts.sort((a, b) => a.mrp - b.mrp).reverse();
      }
    }

    // Return the response
    res.status(200).json({
      success: true,
      message: "Recommended products retrieved successfully",
      recommendedProducts,
      product: targetProduct,
    });
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const searchMobileNumber = async (req, res) => {
  const { mobileNumber } = req.query;

  try {
    const user = await User.find({ mobileNumber }).lean();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(200).json({ success: false, message: "Server Error" });
  }
};

const getProductByCategory = async (req, res) => {
  const { page = 1, limit = 50, category_slug, sort } = req.query;

  try {
    const skip = (page - 1) * limit;
    const category_name = category_slug.replace("_", " ");
    const products = await Product.find({ category_name })
      .hint({ category_name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = products.length;

    if (sort) {
      if (sort === "price_low_to_high") {
        products.sort((a, b) => a.mrp - b.mrp);
      } else if (sort === "price_high_to_low") {
        products.sort((a, b) => a.mrp - b.mrp).reverse();
      }
    }

    res.json({
      success: true,
      message: "Products retrieved successfully",
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(200).json({
      success: false,
      message: "Server Error",
      products: [],
      total: 0,
      page: 1,
      totalPages: 0,
    });
  }
};

module.exports = {
  searchProducts,
  recommendedProducts,
  searchMobileNumber,
  getProductByCategory,
};
