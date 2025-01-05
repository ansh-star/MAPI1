const express = require("express");
const {
  addCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
  getCategory,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("", addCategory);

router.put("", updateCategory);

router.delete("/:categoryId", deleteCategory);

router.get("/search", searchCategories);

router.get("/:categoryId", getCategory);
module.exports = router;
