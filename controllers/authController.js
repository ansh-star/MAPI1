const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");
const User = require("../models/User"); // Import your User model
const { doesAdminExist, doesUserExist } = require("../utils/doesUserExist");
const Roles = require("../utils/roles");
const { generateToken } = require("../utils/tokenGenerator");

// Function to handle Admin signup
const signupAdmin = async (req, res, next) => {
  const { username, mobileNumber, location, adminKey } = req.body;
  try {
    const admin = new Admin({ username, mobileNumber, location, adminKey });
    await admin.save();

    // res.status(201).json({
    //   success: true,
    //   message: "Admin registered successfully!",
    // });
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin registration failed",
      error: error.message,
    });
  }
};

// Signup function for user
const signupUser = async (req, res, next) => {
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

    next();
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
        options: { limit: 50 },
      })
      .populate({ path: "productList", option: { limit: 50 } });

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
      .populate({ path: "products", option: { limit: 50 } })
      .populate({
        path: "cart.productId", // Populates the 'productId' inside 'cart'
        options: { limit: 50 },
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

const checkAdminNotExist = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Check if any of the unique fields already exist
    const { mobileNumber, adminKey } = req.body;

    const existingAdmin = await Admin.findOne({
      $or: [{ mobileNumber }, { adminKey }],
    });

    // If an existing admin is found, determine which field conflicts
    if (existingAdmin) {
      if (existingAdmin.mobileNumber === mobileNumber) {
        return res
          .status(400)
          .json({ success: false, error: "Mobile Number already exists" });
      }
      if (existingAdmin.adminKey === adminKey) {
        return res
          .status(400)
          .json({ success: false, error: "Admin Key already exists" });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const checkAdminExist = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!doesAdminExist(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "Admin does not exists with this mobile number.",
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const checkUserNotExist = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "User Sign Up failed",
        errors: errors.array(),
      });
    }

    // Check if any of the unique fields already exist
    const { mobileNumber, role, dealershipLicenseNumber, shopOrHospitalName } =
      req.body;

    let check = [{ mobileNumber }];

    // If the role is Wholeseller (1) or Retailer (2), ensure mandatory fields are provided
    if (role === Roles.WHOLESALER || role === Roles.RETAILER) {
      if (!shopOrHospitalName || !dealershipLicenseNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Shop/Hospital Name, Dealership License Number, and Dealership License Image are required for Wholeseller and Retailer.",
        });
      }
      check.push({ dealershipLicenseNumber });
    }

    const existingUser = await User.findOne({ $or: check });

    if (existingUser) {
      if (existingUser.mobileNumber === mobileNumber) {
        return res
          .status(400)
          .json({ success: false, message: "Mobile Number already exists" });
      }
      if (
        dealershipLicenseNumber &&
        existingUser.dealershipLicenseNumber === dealershipLicenseNumber
      ) {
        return res.status(400).json({
          success: false,
          message: "Dealership License Number already exists",
        });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

const checkUserExist = async (req, res, next) => {
  try {
    const { mobileNumber } = req.body;

    if (!doesUserExist(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: "User does not exists with this mobile number.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  signupAdmin,
  signupUser,
  loginAdmin,
  loginUser,
  checkAdminNotExist,
  checkAdminExist,
  checkUserNotExist,
  checkUserExist,
};
