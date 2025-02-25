const express = require("express");
const { createOrder, getOrders, getOrderById, deleteOrder } = require("../controllers/orderController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();
router.post("/", authenticate, createOrder);
router.get("/", authenticate, getOrders);
router.get("/:id", authenticate, getOrderById);
router.delete("/:id", authenticate, deleteOrder);
module.exports = router;
