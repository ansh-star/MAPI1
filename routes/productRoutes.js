const express = require("express");
const { verifyRole } = require("../utils/tokenGenerator");
const { productValidator } = require("../controllers/productChecker");
const { addProduct } = require("../controllers/addController");
const {
  updateProducts,
  addProductWholesaler,
} = require("../controllers/updateController");
const {
  deleteProducts,
  deleteWholesalerProduct,
} = require("../controllers/deleteController");
const {
  getProducts,
  getProduct,
  getMyProducts,
} = require("../controllers/getProductController");
const {
  searchProducts,
  recommendedProducts,
  getProductByCategory,
} = require("../controllers/searchController");
const router = express.Router();

// get products according to pageNumber and limit
router.get("", getProducts);

// search products and get recommended products
router.get("/search", searchProducts);

// get recommended products
router.get("/recommend/:productId", recommendedProducts);

//get product by productId
router.get("/my", getMyProducts);

// get product by category
router.get("/category", getProductByCategory);

router.get("/:productId", getProduct);

// delete product from list of wholesaler
router.delete("/:productId/my", deleteWholesalerProduct);

// add products to list
router.put("/:productId/add", addProductWholesaler);

//verify role of user
router.use(verifyRole);

// add product and validate the body
router.post("", productValidator, addProduct);

// update product information
router.put("", updateProducts);

// delete product
router.delete("/:productId", deleteProducts);

module.exports = router;
