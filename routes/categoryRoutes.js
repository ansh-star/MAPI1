const express = require("express");
const {
  addCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
} = require("../controllers/categoryController");
const router = express.Router();

router.post("", addCategory);

router.put("", updateCategory);

router.delete("", deleteCategory);

router.get("/search", searchCategories);

module.exports = router;
