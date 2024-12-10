const express = require("express");
const { verifyToken, verifyRole } = require("../utils/tokenGenerator");
const { productValidator } = require("../controllers/productChecker");
const { addProduct } = require("../controllers/addController");
const { updateProducts } = require("../controllers/updateController");
const { deleteProducts } = require("../controllers/deleteController");
const { getProducts } = require("../controllers/getProductController");
const {
  searchProducts,
  recommendedProducts,
} = require("../controllers/searchController");
const router = express.Router();

//verfiy token
router.use(verifyToken);

// get products according to pageNumber and limit
router.get("", getProducts);

// search products and get recommended products
router.get("/search", searchProducts);

// get recommended products
router.get("/recommend/:productId", recommendedProducts);

//verify role of user
router.use(verifyRole);

// add product and validate the body
router.post("", productValidator, addProduct);

// update product information
router.put("", updateProducts);

// delete product
router.delete("", deleteProducts);

module.exports = router;
