const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    ref: { type: String, required: true }, // Уникальный код товара
    category: { type: String, required: true }, // Категория (кольца, браслеты и т.д.)
    name: { type: String, required: true }, // Название
    price: { type: Number, required: true }, // Цена
    tags: { type: [String], default: [] }, // Теги (платина, золото и т.д.)
    description: { type: String, required: true }, // Описание
    image: { type: String, required: true } // Ссылка на изображение
});

// Создаем модель продукта
const Product = mongoose.model("Product", productSchema);

module.exports = Product;
