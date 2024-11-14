const { default: mongoose } = require("mongoose");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");
const { deleteProductFromCart } = require("./deleteController");

const addProduct = async (req, res) => {
  const { id, role } = req.user;

  const {
    Medicine_Name,
    Composition,
    Uses,
    Side_effects,
    Image_URL,
    Manufacturer,
  } = req.body;

  try {
    // Create a new product
    const newProduct = new Product({
      Medicine_Name,
      Composition,
      Uses,
      Side_effects,
      Manufacturer,
      Image_URL,
    });

    // Save the product to MongoDB
    await newProduct.save();

    // if user is not admin the add the product id to the user schema
    if (role === Roles.WHOLESALER) {
      const userUpdated = await User.findOneAndUpdate(
        { _id: id },
        { $push: { products: newProduct._id } }
      );
    }
    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: newProduct.toObject(),
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      error: "Failed to create product",
      details: error.message,
    });
  }
};

const addProductToCart = async (req, res) => {
  const { id } = req.user;
  let { productID, quantity } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(productID)) {
      return res.status(200).json({
        success: false,
        message: "Invalid order id. Please provide a valid order id.",
      });
    }
    quantity = parseInt(quantity);
    if (quantity < 0) {
      return res
        .status(200)
        .json({ success: false, message: "Quantity can't be negative" });
    }

    if (quantity === 0) {
      await deleteProductFromCart(req, res);
      return res
        .status(200)
        .json({ success: true, message: "Product added to cart successfully" });
    }

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    const product = user.cart.find((item) => item.productId === productID);

    if (product) {
      if (quantity === 0) {
        user.cart = user.cart.filter((item) => item.productId !== productID);
      } else {
        product.quantity = quantity;
      }
    } else {
      user.cart.push({ productId: productID, quantity: quantity });
    }

    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Product added to cart successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(200)
      .json({ success: false, error: "Failed to add product to cart" });
  }
};

module.exports = { addProduct, addProductToCart };
