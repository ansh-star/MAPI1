const express = require("express");
const { verifyToken, verifyRole } = require("../utils/tokenGenerator");
const { productValidator } = require("../controllers/productChecker");
const { addProduct } = require("../controllers/addController");
const { updateProducts } = require("../controllers/updateController");
const { deleteProducts } = require("../controllers/deleteController");
const { getProducts } = require("../controllers/getProductController");
const router = express.Router();

//verfiy token
router.use(verifyToken);

// get products according to pageNumber and limit
router.get("", getProducts);

//verify role of user
router.use(verifyRole);

// add product and validate the body
router.post("", productValidator, addProduct);

// update product information
router.put("", updateProducts);

// delete product
router.delete("", deleteProducts);

module.exports = router;
