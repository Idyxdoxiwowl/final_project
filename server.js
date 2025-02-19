const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Подключение к MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/jewelry_store").then(() => {
  console.log("✅ MongoDB Connected");
}).catch(err => console.log("❌ DB Connection Error:", err));

// Модель товара
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  image: String
});
const Product = mongoose.model("Product", productSchema);

// Модель пользователя
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// Модель заказа
const orderSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  products: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
  totalPrice: Number
});
const Order = mongoose.model("Order", orderSchema);

// Регистрация пользователя
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Логин пользователя
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "2h" });

    res.json({ token, email: user.email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware для проверки токена
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Invalid token" });

      req.user = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: "Authentication error" });
  }
};

// Получение случайных товаров (6 штук)
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.aggregate([{ $sample: { size: 6 } }]);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Ошибка при получении товаров" });
  }
});

// Создание заказа
app.post("/api/orders", authenticate, async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    // Получаем реальные цены продуктов
    const productIds = products.map(p => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== products.length) {
      return res.status(400).json({ error: "Some products not found" });
    }

    // Подсчет итоговой суммы
    let totalPrice = 0;
    products.forEach(p => {
      const product = dbProducts.find(prod => prod._id.toString() === p.productId);
      totalPrice += product.price * p.quantity;
    });

    const newOrder = new Order({ userId: req.user.userId, products, totalPrice });
    await newOrder.save();
    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Получение заказов пользователя
app.get("/api/orders", authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate("products.productId", "name price image");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
