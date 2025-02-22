const express = require("express");
const { registerUser, loginUser, getProfile, updateProfile, getUsers, deleteUser } = require("../controllers/authController");
const { authenticate, checkAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, updateProfile);

// Новый маршрут для получения всех пользователей (только для админа)
router.get("/users", authenticate, checkAdmin, getUsers);

// Новый маршрут для удаления пользователей (только для админа)
router.delete("/users/:id", authenticate, checkAdmin, deleteUser);

module.exports = router;
