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
    console.log("📥 New Product Data:", req.body); 

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
    const updates = req.body; 

    console.log("🛠 Updating product:", id, updates); 

    // Проверяем, существует ли товар
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "❌ Product not found" });
    }

    // Используем findByIdAndUpdate для более чистого кода
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,            // Возвращаем обновленный документ
      runValidators: true,  // Проверяем, что данные корректны по схеме
    });

    res.json({ message: "✅ Product updated successfully!", product: updatedProduct });
  } catch (error) {
    console.error("❌ Error updating product:", error); 
    res.status(500).json({ error: "❌ Error updating product" });
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
