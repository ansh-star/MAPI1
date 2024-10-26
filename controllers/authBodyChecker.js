const { body } = require("express-validator");
const Roles = require("../utils/roles");

const validateAdminSignUpBody = [
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .bail()
    .isString()
    .withMessage("Username must be a string")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),

  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required")
    .bail()
    .isMobilePhone()
    .withMessage("Mobile number must be a valid phone number"),

  body("location")
    .notEmpty()
    .withMessage("Location is required")
    .bail()
    .isString()
    .withMessage("Location must be a string"),

  body("adminKey").notEmpty().withMessage("Admin key is required"),
];

const validateAdminLoginBody = [
  body("mobileNumber")
    .notEmpty()
    .withMessage("Mobile number is required")
    .bail()
    .isMobilePhone()
    .withMessage("Mobile number must be a valid phone number"),

  body("adminKey")
    .notEmpty()
    .withMessage("Admin key is required")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Admin key must be at least 8 characters long"),
];

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
  validateAdminSignUpBody,
  validateAdminLoginBody,
  validateUserLoginBody,
  validateUserSignupBody,
};
