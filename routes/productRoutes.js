const express = require("express");
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { authenticate, checkAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts); // Получение всех товаров
router.post("/", authenticate, checkAdmin, createProduct); // Добавление товара (только админ)
router.put("/:id", authenticate, checkAdmin, updateProduct); // Обновление товара (только админ)
router.delete("/:id", authenticate, checkAdmin, deleteProduct); // Удаление товара (только админ)

module.exports = router;
