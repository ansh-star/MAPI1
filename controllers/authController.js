const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/User"); // Import your User model
const { generateToken } = require("../utils/tokenGenerator");
const Roles = require("../utils/roles");

// Function to handle Admin signup
const signupAdmin = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { username, mobileNumber, location, adminKey } = req.body;
  try {
    const isExistUser = await Admin.findOne({ mobileNumber });

    if (isExistUser) {
      return res.status(200).json({
        success: true,
        message: "Phone Number already Exists",
      });
    }

    const admin = new Admin({ username, mobileNumber, location, adminKey });
    await admin.save();

    res.status(201).json({
      success: true,
      message: "Admin registered successfully!",
      role: Roles.ADMIN,
      user: admin.toObject(),
      token: generateToken({ _id: admin._id, role: Roles.ADMIN }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message,
    });
  }
};

// Signup function for user
const signupUser = async (req, res) => {
  // Validate request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "User Sign Up failed",
      errors: errors.array(),
    });
  }

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
    // Check if the user already exists
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this mobile number.",
      });
    }

    // If the role is Wholeseller (1) or Retailer (2), ensure mandatory fields are provided
    if (role === Roles.WHOLESALER || role === Roles.RETAILER) {
      if (
        !shopOrHospitalName ||
        !dealershipLicenseNumber ||
        !dealershipLicenseImage
      ) {
        return res.status(400).json({
          status: false,
          message:
            "Shop/Hospital Name, Dealership License Number, and Dealership License Image are required for Wholeseller and Retailer.",
        });
      }
    }

    // Create a new user
    const newUser = new User({
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
      user_verified: false, // Initially set to false
    });

    // Save the user to the database
    await newUser.save();

    if (role === Roles.WHOLESALER) {
      await Admin.updateMany({ $push: { wholesalerRequests: newUser._id } });
    }

    // Respond with success
    res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: newUser.toObject(),
      token: generateToken(newUser),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Function to handle Admin login
const loginAdmin = async (req, res) => {
  const { mobileNumber, adminKey } = req.body;

  try {
    // paging in product list
    const admin = await Admin.findOne({ mobileNumber, adminKey })
      .populate({
        path: "wholesalerRequests", // Path to populate
        match: { role: Roles.WHOLESALER, user_verified: false }, // Condition: Only fetch users with role: 1 (wholesalers) and user_verified: false
        options: { limit: 10 },
      })
      .populate({ path: "productList", option: { limit: 10 } });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ _id: admin._id, role: Roles.ADMIN });

    res.status(201).json({
      success: true,
      message: "Login successful",
      user: admin.toObject(),
      token,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Login failed", error: error.message });
  }
};

// Login function for User
const loginUser = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    // Check if the user exists by mobile number and username
    const user = await User.findOne({ mobileNumber })
      .populate({ path: "products", option: { limit: 10 } })
      .populate({
        path: "cart.productId", // Populates the 'productId' inside 'cart'
        options: { limit: 10 },
      });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number or username.",
      });
    } else {
      // Successful login, return user data (you might want to include a JWT token here for session management)
      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: user.toObject(),
        token: generateToken(user),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
module.exports = {
  signupAdmin,
  signupUser,
  loginAdmin,
  loginUser,
};
