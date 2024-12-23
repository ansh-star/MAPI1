const { validationResult } = require("express-validator");
const User = require("../models/User"); // Import your User model
const { doesUserExist } = require("../utils/doesUserExist");
const Roles = require("../utils/roles");
const { generateToken } = require("../utils/tokenGenerator");
const bcrypt = require("bcryptjs");

// Signup function for user
const signupUser = async (req, res, next) => {
  const {
    username,
    fullName,
    password,
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
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({
      username,
      fullName,
      password: encryptedPassword,
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
      await User.updateMany(
        { role: Roles.ADMIN },
        { $push: { wholesalerRequests: newUser._id } }
      );
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server error" });
  }
};

// Login function for User
const loginUser = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    // Check if the user exists by mobile number and username
    const user = await User.findOne({ mobileNumber });

    if (!user) {
      return res.status(200).json({
        success: false,
        message: "Invalid mobile number or username.",
      });
    } else {
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: "Login successful!",
        user: user.toObject(),
        token: generateToken(user),
      });
    }
  } catch (error) {
    console.error(error);
    res.status(200).json({ success: false, message: "Server error" });
  }
};

const checkUserNotExist = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(200).json({
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
        return res.status(200).json({
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
          .status(200)
          .json({ success: false, message: "Mobile Number already exists" });
      }
      if (
        dealershipLicenseNumber &&
        existingUser.dealershipLicenseNumber === dealershipLicenseNumber
      ) {
        return res.status(200).json({
          success: false,
          message: "Dealership License Number already exists",
        });
      }
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, error: "Server error" });
  }
};

const checkUserExist = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(200).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { mobileNumber, role } = req.body;

    const userCheck = await doesUserExist(mobileNumber, role);

    if (!userCheck) {
      return res.status(200).json({
        success: false,
        message: "User does not exists with this mobile number.",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(200).json({ success: false, error: "Server error" });
  }
};

const loginUserWithPassword = async (req, res) => {
  const { mobileNumber, password } = req.body;

  try {
    const user = await User.findOne({ mobileNumber }).lean();
    if (!user) {
      return res.status(200).json({
        success: false,
        user_verified: false,
        message: "Invalid mobile number",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(200).json({
        success: false,
        user_verified: false,
        message: "Invalid password",
      });
    }
    if (user.mobile_verified === false) {
      return res.status(200).json({
        success: true,
        user_verified: false,
        message: "User mobile Number is not verified",
      });
    }
    const token = generateToken(user);
    user.password = undefined;
    return res.status(200).json({
      success: true,
      user_verified: true,
      message: "Login successful!",
      user,
      token,
    });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
module.exports = {
  signupUser,
  loginUser,
  checkUserNotExist,
  checkUserExist,
  loginUserWithPassword,
};
