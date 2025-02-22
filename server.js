const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path"); // Добавляем модуль path для работы с путями
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Раздача статических файлов из папки public
app.use(express.static(path.join(__dirname, "public")));

// Основные маршруты API
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);

// Middleware обработки ошибок
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
