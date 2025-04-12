const Category = require("../models/Category");

const addCategory = async (req, res) => {
  try {
    const category = new Category({ ...req.body });
    await category.save();
    res
      .status(201)
      .json({ success: true, message: "Category added successfully" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.body.id,
      { ...req.body },
      { new: true }
    );
    if (category) {
      return res
        .status(200)
        .json({ success: true, message: "Category updated successfully" });
    }
    res.status(200).json({ success: false, message: "Category not found" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.categoryId);
    if (category) {
      return res
        .status(200)
        .json({ success: true, message: "Category deleted successfully" });
    }
    res.status(200).json({ success: false, message: "Category not found" });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
const searchCategories = async (req, res) => {
  try {
    const category = await Category.find({
      category_name: { $regex: `^${req.query.prefix}`, $options: "i" },
    })
      .hint({ category_name: 1 })
      .limit(10)
      .lean();
    return res.status(200).json({ success: true, category });
  } catch (error) {
    res
      .status(200)
      .json({ success: false, message: "Error searching the category" });
  }
};

const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    res.status(200).json({ success: true, category });
  } catch (error) {
    res
      .status(200)
      .json({ success: false, message: "Error in fetching the category" });
  }
};
const getCategories = async (req, res) => {
  const { pageNumber = 1, limit = 10 } = req.query;
  try {
    const categories = await Category.aggregate([
      { $skip: (parseInt(pageNumber) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ]);
    res
      .status(200)
      .json({
        success: true,
        categories,
        totalDocuments: await Category.estimatedDocumentCount(),
      });
  } catch (error) {
    res.status(200).json({ success: false, message: error.message });
  }
};
module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  searchCategories,
  getCategory,
  getCategories,
};
