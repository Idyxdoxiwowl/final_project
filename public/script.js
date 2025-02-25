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
    const addProductForm = document.getElementById("add-product-form");

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

    // Проверка токена и роли пользователя
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

    // Загрузка товаров  // GET /products
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
                        <button class="edit-btn" data-id="${product._id}">Edit</button>
                        <button class="delete-btn" data-id="${product._id}">Delete</button>
                    `;
                }                
                productList.appendChild(productCard);
            });

            attachBuyButtons();
            attachDeleteButtons();
            attachEditButtons();
        } catch (error) {
            console.error("Error fetching products:", error);
            productList.innerHTML = "<p>Failed to load products.</p>";
        }
    }


    document.getElementById("add-product-form").addEventListener("submit", async (e) => {
        e.preventDefault();
    
        const name = document.getElementById("product-name").value.trim();
        const price = parseFloat(document.getElementById("product-price").value.trim());
        const description = document.getElementById("product-description").value.trim();
        const image = document.getElementById("product-image").value.trim();
        const category = document.getElementById("product-category").value;
        const tags = document.getElementById("product-tags").value.split(",").map(tag => tag.trim());
    
        // ✅ Генерируем уникальный `ref`
        const ref = `REF-${Math.random().toString(36).substr(2, 9)}`;
    
        if (!name || isNaN(price) || !description || !image || !category || tags.length === 0) {
            alert("⚠️ All fields are required!");
            return;
        }
             
        try {       //POST /products
            const response = await fetch("https://final-project-afz0.onrender.com/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ ref, category, name, price, tags, description, image }),
            });
    
            const data = await response.json();
            if (response.ok) {
                alert("✅ Product added successfully!");
                document.getElementById("add-product-form").reset();
                loadProducts();
            } else {
                console.error("❌ Error:", data.error);
                alert(`❌ Error: ${data.error}`);
            }
        } catch (error) {
            console.error("❌ Error adding product:", error);
        }
    });
    
    
 
    // Покупка товара  POST /orders
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

    // Удаление товара (для админов) DELETE /products/:id
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

    async function loadUsers() {
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/users", {
                headers: { "Authorization": `Bearer ${token}` },
            });
            const users = await response.json();
            userList.innerHTML = "";

            users.forEach(user => {
                const userItem = document.createElement("div");
                userItem.innerHTML = `
                    <p>${user.email} (${user.role})</p>
                    <button class="delete-user-btn" data-id="${user._id}">Delete</button>
                `;
                userList.appendChild(userItem);
            });

            attachDeleteUserButtons();
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    // PUT /products/:id:
    function attachEditButtons() {
        document.querySelectorAll(".edit-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                if (!token || userRole !== "admin") {
                    alert("Only admin can edit products!");
                    return;
                }
    
                const newName = prompt("Enter new product name:");
                const newPrice = prompt("Enter new price:");
                const newDescription = prompt("Enter new description:");
                const newImage = prompt("Enter new image URL:");
    
                if (!newName || !newPrice || !newDescription || !newImage) return;
    
                try {
                    const response = await fetch(`https://final-project-afz0.onrender.com/api/products/${productId}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: newName,
                            price: parseFloat(newPrice),
                            description: newDescription,
                            image: newImage
                        })
                    });
    
                    if (response.ok) {
                        alert("✅ Product updated successfully!");
                        loadProducts(); // Обновляем список
                    }
                } catch (error) {
                    console.error("Error updating product:", error);
                }
            });
        });
    }
    

    // Удаление пользователей (для админа)  DELETE /users/:id
    function attachDeleteUserButtons() {
        document.querySelectorAll(".delete-user-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.dataset.id;
                try {
                    await fetch(`https://final-project-afz0.onrender.com/api/auth/users/${userId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` },
                    });

                    loadUsers();
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            });
        });
    }

    // Загрузка профиля    GET /auth/profile
    async function loadUserProfile() {
        const token = localStorage.getItem("token");
    
        if (!token) {
            console.error("❌ Ошибка: Токен отсутствует в localStorage");
            return;
        }
    
        console.log("🔍 Отправка запроса с токеном:", token); // ✅ Лог отправляемого токена
    
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/profile", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` },
            });
    
            if (!response.ok) {
                throw new Error(`Failed to fetch profile: ${response.status}`);
            }
    
            const user = await response.json();
            console.log("✅ Получен профиль:", user); // ✅ Лог полученных данных
    
            document.getElementById("profile-email").innerText = `Email: ${user.email}`;
        } catch (error) {
            console.error("❌ Ошибка загрузки профиля:", error);
        }
    }
    
 
    // Обновление профиля  PUT /auth/profile
    updateProfileBtn.addEventListener("click", async () => {
        const newEmail = prompt("Enter new email:");
        if (!newEmail) return;

        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ email: newEmail }),
            });

            if (!response.ok) {
                throw new Error(`Failed to update profile: ${response.status}`);
            }

            alert("✅ Profile updated successfully!");
            loadUserProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });
      // DELETE /users/:id
    function attachDeleteUserButtons() {
        document.querySelectorAll(".delete-user-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.dataset.id;
                try {
                    await fetch(`https://final-project-afz0.onrender.com/api/auth/users/${userId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` },
                    });

                    loadUsers();
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            });
        });
    }

    loadProducts();
    if (userRole === "admin") {
        loadUsers();
    }
});
