const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    ref: { type: String, required: true }, // Уникальный код товара
    category: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    tags: { type: [String], default: [] }, 
    description: { type: String, required: true }, 
    image: { type: String, required: true } 
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
