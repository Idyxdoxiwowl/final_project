const Product = require("../models/Product");

// Получение товаров (Read)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 12 } }]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

// Добавление товара (Create) (для администратора)
exports.createProduct = async (req, res) => {
  try {
    console.log("📥 New Product Data:", req.body); // ✅ Логируем полученные данные

    const { ref, category, name, price, tags, description, image } = req.body;

    if (!ref || !category || !name || !price || !description || !image) {
      return res.status(400).json({ error: "⚠️ All fields are required!" });
    }

    const newProduct = new Product({ ref, category, name, price, tags, description, image });
    await newProduct.save();
    res.status(201).json({ message: "✅ Product created successfully", product: newProduct });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ error: "❌ Server error, try again later" });
  }
};


// Обновление товара (Update)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, image } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (description) product.description = description;
    if (image) product.image = image;

    await product.save();
    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ error: "Error updating product" });
  }
};

// Удаление товара (Delete)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
};
