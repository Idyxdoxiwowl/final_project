const express = require("express");
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { authenticate, checkAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getProducts); // Получение всех товаров
router.post("/", authenticate, checkAdmin, createProduct); // Только для админа
router.put("/:id", authenticate, checkAdmin, updateProduct);
router.delete("/:id", authenticate, checkAdmin, deleteProduct);

module.exports = router;
