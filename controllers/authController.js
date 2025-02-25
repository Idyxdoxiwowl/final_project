const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerSchema, loginSchema } = require("../validators/userValidator");

const JWT_SECRET = process.env.JWT_SECRET;

// Регистрация пользователя
exports.registerUser = async (req, res) => {
    try {
        const { error } = registerSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Если email админа, назначаем роль "admin"
        const role = email === "admin@mail.com" ? "admin" : "user";

        const newUser = new User({ email, password: hashedPassword, role });
        await newUser.save();

        res.status(201).json({ message: "User registered successfully", role });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// Авторизация пользователя
exports.loginUser = async (req, res) => {
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

        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "2h" });

        res.json({ token, email: user.email, role: user.role }); //  возвращаем роль
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Получение профиля пользователя
exports.getProfile = async (req, res) => {
    try {
        console.log("🔍 Getting profile, user:", req.user);

        if (!req.user || !req.user._id) {
            console.error("❌ Error: User not found");
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }

        const user = await User.findById(req.user._id).select("-password");

        if (!user) {
            console.error("❌ Error: User not found in database");
            return res.status(404).json({ error: "User not found" });
        }

        console.log("✅ Profile found:", user); 
        res.json({ email: user.email });
    } catch (error) {
        console.error("❌ Error loading profile:", error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
};



// Обновление профиля пользователя
exports.updateProfile = async (req, res) => {
    try {
        console.log("🔍 Profile update received by user:", req.user); // ✅ Лог

        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        // Убедимся, что пользователь передается
        if (!req.user || !req.user._id) {
            console.error("❌ Error: User not found");
            return res.status(401).json({ error: "Unauthorized: No user found" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            console.error("❌ Error: User not found in database");
            return res.status(404).json({ error: "User not found" });
        }

        // Проверяем, чтобы email не был уже занят другим пользователем
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== req.user._id.toString()) {
            return res.status(400).json({ error: "This email is already in use" });
        }

        user.email = email;
        await user.save(); // Сохраняем обновленный email в MongoDB

        console.log("✅ Updated profile:", user); // ✅ Лог
        res.json({ message: "Profile updated successfully!", email: user.email });
    } catch (error) {
        console.error("❌ Profile update error:", error);
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
