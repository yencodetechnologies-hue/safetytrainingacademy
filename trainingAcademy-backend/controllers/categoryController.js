const Category = require("../models/Category");

// CREATE CATEGORY
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await Category.findOne({ name: name.trim() });

    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const lastCategory = await Category.findOne().sort("-order");

    const newCategory = new Category({
      name,
      order: lastCategory ? lastCategory.order + 1 : 1,
    });

    await newCategory.save();

    res.status(201).json(newCategory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort("order");

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.courseCount > 0) {
      category.active = false;
      await category.save();

      return res.json({ message: "Category deactivated" });
    }

    await Category.findByIdAndDelete(id);

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    // [{id, order}]

    const bulkOps = categories.map((cat) => ({
      updateOne: {
        filter: { _id: cat.id },
        update: { order: cat.order },
      },
    }));

    await Category.bulkWrite(bulkOps);

    res.json({ message: "Reordered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};