const { body } = require("express-validator");
const Roles = require("../utils/roles");

const validateUserSignupBody = [
  body("username").notEmpty().withMessage("Username is required"),
  body("fullName").notEmpty().withMessage("Full Name is required"),
  body("mobileNumber")
    .isNumeric()
    .isLength({ min: 10, max: 10 })
    .withMessage("Enter a valid mobile number"),
  body("role").isIn(Object.values(Roles)).withMessage("Invalid role specified"), // Role must be Wholeseller (1), Retailer (2), or Delivery Partner (3)
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/\d/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character"),
];

const validateUserLoginBody = [
  body("mobileNumber")
    .isNumeric()
    .isLength({ min: 10, max: 10 })
    .withMessage("Enter a valid mobile number"),
  body("password").notEmpty().withMessage("Password is required"),
];

module.exports = {
  validateUserLoginBody,
  validateUserSignupBody,
};
