const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/userValidator");

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация пользователя
exports.registerUser = async (req, res) => {
    try {
        // Валидация входных данных
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password, role } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
            role: role || "user" // По умолчанию пользователь
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Register Error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Авторизация пользователя
exports.loginUser = async (req, res) => {
    try {
        // Валидация входных данных
        const { error } = loginSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ token, email: user.email, role: user.role });
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Получение профиля пользователя
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("Profile Fetch Error:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.email = email || user.email;
        await user.save();

        res.json({ message: "Profile updated successfully", user });
    } catch (error) {
        console.error("Profile Update Error:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};

// Получение списка всех пользователей (для админов)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error("Get Users Error:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
};

// Удаление пользователя (для админов)
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.userId === id) {
            return res.status(403).json({ error: "You cannot delete your own account" });
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Delete User Error:", error);
        res.status(500).json({ error: "Error deleting user" });
    }
};
