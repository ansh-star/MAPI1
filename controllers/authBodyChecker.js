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
];

const validateUserLoginBody = [
  body("mobileNumber")
    .isNumeric()
    .isLength({ min: 10, max: 10 })
    .withMessage("Enter a valid mobile number"),
];

module.exports = {
  validateUserLoginBody,
  validateUserSignupBody,
};
