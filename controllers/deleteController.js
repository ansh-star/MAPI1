const Admin = require("../models/Admin");
const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");
const deleteAdminDetails = async (req, res) => {
  const { adminKey } = req.body;
  const { role, id } = req.user;
  if (!adminKey) {
    return res.status(400).json({
      success: false,
      message: "Please provide admin key",
    });
  }
  if (role !== Roles.ADMIN) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to delete an admin",
    });
  }
  try {
    // Deleted a user
    const deletedAdmin = await Admin.findOneAndDelete({ _id: id, adminKey });

    if (!deletedAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin does not exists with this id and admin key.",
      });
    }

    // Respond with success
    res.status(201).json({
      success: true,
      message: "Admin deleted successfully!",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteUserDetails = async (req, res) => {
  try {
    // Delete a user
    const existingUser = await User.findOneAndDelete({ _id: req.user.id });
    if (!existingUser) {
      return res.status(400).json({
        success: false,
        message: "User does not exists with this id.",
      });
    }
    // Respond with success
    res.status(201).json({
      success: true,
      message: "User deleted successfully!",
      user: existingUser.toObject(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteProducts = async (req, res) => {
  const { id: userId, role } = req.user;
  const { id: productId } = req.body;
  try {
    // check if the user is a wholesaler
    if (role === Roles.WHOLESALER) {
      var userProductDeletion = await User.findOneAndUpdate(
        { _id: userId },
        { $pull: { products: productId } },
        { new: true }
      );
      // if product not in the wholesaler products array the user cannot delete the product
      if (!userProductDeletion) {
        return res.status(400).json({
          success: false,
          message: "This user does not exists with this id.",
        });
      }
    }
    // delete the product
    const deletedProduct = await Product.findOneAndDelete({ _id: productId });

    // no such product exists then return error
    if (!deletedProduct) {
      return res.status(400).json({
        success: false,
        message: "Product does not exists with this id.",
      });
    }

    // delete product from all users cart
    await User.updateMany(
      { "cart.productId": deletedProduct._id },
      { $pull: { cart: { productId: deletedProduct._id } } }
    );

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Product Deleted Successfully",
      user: userProductDeletion.toObject(),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { deleteUserDetails, deleteAdminDetails, deleteProducts };
