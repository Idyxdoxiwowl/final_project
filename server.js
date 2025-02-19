// server.js - Jewelry Store Backend с локальным MongoDB Compass
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// Подключение к локальному MongoDB Compass
mongoose.connect("mongodb://127.0.0.1:27017/jewelry_store").then(() => {
  console.log("✅ MongoDB Compass connected");
}).catch(err => console.log("❌ DB Connection Error:", err));

// Модель товара
const productSchema = new mongoose.Schema({
  ref: String,
  category: String,
  name: String,
  price: Number,
  tags: [String],
  description: String,
  image: String
});
const Product = mongoose.model("Product", productSchema);

// Модель пользователя
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model("User", userSchema);

// Модель заказа
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  products: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  totalPrice: Number
});
const Order = mongoose.model("Order", orderSchema);

// Получение всех товаров
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении товаров" });
  }
});

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: "User registered" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Создание заказа
app.post("/api/orders", async (req, res) => {
  try {
    const { userId, products } = req.body;
    const totalPrice = products.reduce((acc, p) => acc + p.quantity * 100, 0);
    const newOrder = new Order({ userId, products, totalPrice });
    await newOrder.save();
    res.status(201).json({ message: "Order created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.delete("/api/orders/:id", async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.findByIdAndDelete(orderId);
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
});


app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
