const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware для аутентификации пользователей.
 * Проверяет наличие и валидность JWT токена.
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Найти пользователя в базе данных
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("Authentication error:", err);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};

/**
 * Middleware для проверки, является ли пользователь администратором.
 */
const checkAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Access denied, admin only" });
    }
};

/**
 * Middleware для авторизации по ролям.
 * Позволяет доступ только пользователям с указанными ролями.
 * @param {Array} roles - массив разрешенных ролей (например, ["admin"])
 */
const authorize = (roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ error: "Forbidden: Insufficient role permissions" });
    }
    next();
};

module.exports = { authenticate, checkAdmin, authorize };
