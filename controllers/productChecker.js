const { body } = require("express-validator");

const productValidator = [
  body("Medicine_Name")
    .notEmpty()
    .withMessage("Medicine Name is required.")
    .isString()
    .withMessage("Medicine Name must be a string."),
];

module.exports = { productValidator };
