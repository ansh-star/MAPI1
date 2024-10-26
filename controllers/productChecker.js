const { body } = require("express-validator");

const productValidator = [
  body("Medicine_Name")
    .notEmpty()
    .withMessage("Medicine Name is required.")
    .isString()
    .withMessage("Medicine Name must be a string."),

  body("Composition")
    .notEmpty()
    .withMessage("Composition is required.")
    .isString()
    .withMessage("Composition must be a string."),

  body("Uses")
    .notEmpty()
    .withMessage("Uses are required.")
    .isString()
    .withMessage("Uses must be a string."),

  body("Side_effects")
    .notEmpty()
    .withMessage("Side effects are required.")
    .isString()
    .withMessage("Side effects must be a string."),

  body("Image_URL")
    .optional() // This field is not mandatory
    .isURL()
    .withMessage("Image URL must be a valid URL."),

  body("Manufacturer")
    .notEmpty()
    .withMessage("Manufacturer is required.")
    .isString()
    .withMessage("Manufacturer must be a string."),
];

module.exports = { productValidator };
