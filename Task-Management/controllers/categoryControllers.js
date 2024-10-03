const Category = require('../models/categoryModel');

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body;

        const existingCategory = await Category.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({ message: 'Category already exists' });
        }

   
        const category = await Category.create({ name, description });

        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
}


// Get all categories
exports.getAllCategories = async (req, res) => {
    try{
        const categories = await Category.find();
        res.json(categories);
    }catch (error) {
    res.status(500).json({ message: 'Error creating categories', error });
    }
}




