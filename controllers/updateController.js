const Product = require("../models/Product");
const User = require("../models/User");
const Roles = require("../utils/roles");
const updateAdminDetails = async (req, res) => {
  const { id, role } = req.user;

  // check if the user is an admin
  if (role !== Roles.ADMIN) {
    return res.status(200).json({
      success: false,
      message: "This role cannot update the admin",
    });
  }

  const { username, location, adminKey } = req.body;

  try {
    const updatedAdmin = await User.findOneAndUpdate(
      { _id: id },
      { username, location },
      { new: true }
    ).select("-wholesalerRequests -productList");

    if (!updatedAdmin) {
      return res.status(200).json({
        success: false,
        message: "Admin does not exists",
      });
    }

    res.status(201).json({
      success: true,
      message: "Admin updated successfully!",
      user: updatedAdmin.toObject(),
    });
  } catch (error) {
    res.status(200).json({
      success: false,
      message: "Admin updation failed",
      error: error.message,
    });
  }
};
const updateUserDetails = async (req, res) => {
  const {
    username,
    fullName,
    shopOrHospitalName,
    mobileNumber,
    location,
    email,
    dealershipLicenseNumber,
    dealershipLicenseImage,
    role,
    addressList,
  } = req.body;
  try {
    // Create a new user
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        username,
        fullName,
        shopOrHospitalName,
        mobileNumber,
        location,
        email,
        dealershipLicenseNumber,
        dealershipLicenseImage,
        role,
        addressList,
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(200).json({
        success: false,
        message: "User does not exists with this id.",
      });
    }
    // Respond with success
    res.status(201).json({
      success: true,
      message: "User updated successfully!",
      user: updatedUser.toObject(),
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server error" });
  }
};

const updateProducts = async (req, res) => {
  const {
    id,
    medicine_name,
    composition,
    uses,
    side_effects,
    image_url,
    manufacturer,
  } = req.body;
  const { id: userId, role } = req.user;
  try {
    // check if the user is a wholesaler
    if (role === Roles.WHOLESALER) {
      // check if the product exists in the wholesaler products array
      const existsProduct = await User.findOne({ _id: userId, products: id });

      // if it does not exists then user cannot change the product
      if (!existsProduct) {
        return res
          .status(200)
          .json({ success: false, message: "User cannot change this product" });
      }
    }

    // update the product
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id },
      {
        Medicine_Name: medicine_name,
        Composition: composition,
        Uses: uses,
        Side_effects: side_effects,
        Image_URL: image_url,
        Manufacturer: manufacturer,
      },
      { new: true }
    );

    // if product does not exists then return error
    if (!updatedProduct) {
      return res.status(200).json({
        success: false,
        message: "Product does not exists with this id.",
      });
    }

    // Respond with success
    res.status(200).json({
      success: true,
      message: "Product updated Successfully",
      product: updatedProduct.toObject(),
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server error" });
  }
};

const verifyUser = async (req, res) => {
  const { id: adminId, role } = req.user;

  // check if the user is an admin
  if (role !== Roles.ADMIN) {
    return res.status(200).json({
      success: false,
      message: "This role cannot verify the user",
    });
  }

  const { id: userId } = req.body;

  if (!userId) {
    return res.status(200).json({
      success: false,
      message: "User id is required",
    });
  }

  try {
    // check if the admin exists
    const updatedAdmin = await User.updateMany(
      { _id: adminId },
      {
        $pull: { wholesalerRequests: userId },
      }
    );

    if (!updatedAdmin) {
      return res.status(200).json({
        success: false,
        message: "Admin does not exists with this id or admin key",
      });
    }
    // verify the user
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { isVerified: true },
      { new: true }
    );

    if (!user) {
      return res
        .status(200)
        .json({ success: false, message: "User not found" });
    }

    // respond with success
    return res.status(200).json({
      success: true,
      message: "User verified successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  updateUserDetails,
  updateAdminDetails,
  updateProducts,
  verifyUser,
};
