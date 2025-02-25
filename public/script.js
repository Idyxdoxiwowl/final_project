document.addEventListener("DOMContentLoaded", async () => {
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const authForm = document.getElementById("auth-form");
    const authTitle = document.getElementById("auth-title");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitAuth = document.getElementById("submit-auth");
    const toggleRegister = document.getElementById("toggle-register");
    const userDisplay = document.getElementById("user-info");
    const productList = document.getElementById("product-list");
    const adminPanel = document.getElementById("admin-panel");
    const userList = document.getElementById("user-list");
    const profileSection = document.getElementById("profile-section");
    const profileEmail = document.getElementById("profile-email");
    const updateProfileBtn = document.getElementById("update-profile-btn");

    let isLogin = true;

    // Переключение между логином и регистрацией
    toggleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? "Login" : "Register";
        submitAuth.textContent = isLogin ? "Login" : "Register";
        toggleRegister.innerHTML = isLogin
            ? "Don't have an account? <a href='#'>Register here</a>"
            : "Already have an account? <a href='#'>Login here</a>";
    });

    // Проверка токена
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    if (token && userEmail) {
        authForm.style.display = "none";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userDisplay.innerHTML = `<strong>👤 ${userEmail} (${userRole})</strong>`;

        if (userRole === "admin") {
            adminPanel.style.display = "block";
            await loadUsers();
        }

        profileSection.style.display = "block";
        await loadUserProfile();
    }

    // Выход из аккаунта
    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        setTimeout(() => {
            location.href = "index.html";
        }, 100);
    });

    // Авторизация / регистрация
    submitAuth.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const url = isLogin
            ? "https://final-project-afz0.onrender.com/api/auth/login"
            : "https://final-project-afz0.onrender.com/api/auth/register";

        const body = isLogin ? { email, password } : { email, password, role: "user" };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userEmail", email);
                localStorage.setItem("userRole", data.role);
                location.href = "index.html";
            } else {
                alert(data.error || "Authentication failed.");
            }
        } catch (error) {
            console.error("Auth error:", error);
            alert("Server error. Please try again later.");
        }
    });

    // Загрузка товаров
    async function loadProducts() {
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/products", {
                method: "GET",
                headers: token ? { "Authorization": `Bearer ${token}` } : {},
            });

            if (!response.ok) throw new Error("Failed to fetch products");

            const products = await response.json();
            productList.innerHTML = "";

            if (products.length === 0) {
                productList.innerHTML = "<p>No products available.</p>";
                return;
            }

            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${product.image || 'placeholder.jpg'}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <span>$${product.price}</span>
                    <button class="buy-btn" data-id="${product._id}">Buy</button>
                `;

                if (userRole === "admin") {
                    productCard.innerHTML += `
                        <button class="delete-btn" data-id="${product._id}">Delete</button>
                    `;
                }
                productList.appendChild(productCard);
            });

            attachBuyButtons();
            attachDeleteButtons();
        } catch (error) {
            console.error("Error fetching products:", error);
            productList.innerHTML = "<p>Failed to load products.</p>";
        }
    }

    // Покупка товара
    function attachBuyButtons() {
        document.querySelectorAll(".buy-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                if (!token) {
                    alert("You need to log in to place an order!");
                    return;
                }

                try {
                    const response = await fetch("https://final-project-afz0.onrender.com/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ products: [{ productId, quantity: 1 }] }),
                    });

                    if (response.ok) alert("✅ Order placed successfully!");
                } catch (error) {
                    console.error("Error placing order:", error);
                }
            });
        });
    }

    // Удаление товара (для админов)
    function attachDeleteButtons() {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                if (!token || userRole !== "admin") {
                    alert("Only admin can delete products!");
                    return;
                }

                try {
                    const response = await fetch(`https://final-project-afz0.onrender.com/api/products/${productId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` },
                    });

                    if (response.ok) {
                        alert("✅ Product deleted successfully!");
                        loadProducts();
                    }
                } catch (error) {
                    console.error("Error deleting product:", error);
                }
            });
        });
    }

    // Загрузка профиля
    async function loadUserProfile() {
        try {
            console.log("Fetching profile..."); // ✅ Логируем запрос
    
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/profile", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
            });
    
            if (!response.ok) throw new Error(`Failed to fetch profile: ${response.status}`);
    
            const user = await response.json();
            console.log("Profile Data:", user); // ✅ Проверяем, пришел ли email
    
            if (!user.email) {
                profileEmail.innerText = "Email not found!";
            } else {
                profileEmail.innerText = `Email: ${user.email}`;
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            profileEmail.innerText = "Error loading profile"; // Показываем ошибку в UI
        }
    }
    
    

    // Обновление профиля
    updateProfileBtn.addEventListener("click", async () => {
        const newEmail = prompt("Enter new email:");
        if (!newEmail) return;
    
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ email: newEmail }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("✅ Profile updated successfully!");
                localStorage.setItem("userEmail", newEmail); // ✅ Обновляем email в локальном хранилище
                loadUserProfile();
            } else {
                alert("❌ Failed to update profile: " + data.error);
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("❌ Server error. Please try again later.");
        }
    });
    

    // Загружаем данные после определения всех функций
    loadProducts();
    if (userRole === "admin") {
        await loadUsers();
    }
});
