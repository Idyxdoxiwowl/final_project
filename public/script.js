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
    const addProductForm = document.getElementById("add-product-form");
    const orderList = document.getElementById("order-list");
    const userList = document.getElementById("user-list");
    const adminOrderList = document.getElementById("admin-orders");

    let isLogin = true;

    toggleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? "Login" : "Register";
        submitAuth.textContent = isLogin ? "Login" : "Register";
        toggleRegister.innerHTML = isLogin
            ? "Don't have an account? <a href='#'>Register here</a>"
            : "Already have an account? <a href='#'>Login here</a>";
    });

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
            loadAllUsers();
            loadAdminOrders();
        }
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        location.href = "index.html";
    });

    submitAuth.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const url = isLogin
            ? `https://final-project-afz0.onrender.com/api/auth/login`
            : `https://final-project-afz0.onrender.com/api/auth/register`;

        const body = isLogin ? { email, password } : { email, password, role: "user" };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
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

    const loadProducts = async () => {
        try {
            const response = await fetch(`https://final-project-afz0.onrender.com/api/products`);
            const products = await response.json();

            if (!productList) return;
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
    };

    const attachBuyButtons = () => {
        document.querySelectorAll(".buy-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                const token = localStorage.getItem("token");

                if (!token) {
                    alert("You need to log in to place an order!");
                    return;
                }

                try {
                    const response = await fetch(`https://final-project-afz0.onrender.com/api/orders`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                        body: JSON.stringify({ products: [{ productId, quantity: 1 }] })
                    });

                    if (response.ok) alert("✅ Order placed successfully!");
                } catch (error) {
                    console.error("Error placing order:", error);
                }
            });
        });
    };

    const attachDeleteButtons = () => {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                const token = localStorage.getItem("token");

                if (!token || userRole !== "admin") {
                    alert("Only admin can delete products!");
                    return;
                }

                try {
                    const response = await fetch(`https://final-project-afz0.onrender.com/api/products/${productId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
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
    };

    const loadAllUsers = async () => {
        try {
            const response = await fetch(`https://final-project-afz0.onrender.com/api/auth/users`);
            const users = await response.json();

            if (!userList) return;
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
    };

    const attachDeleteUserButtons = () => {
        document.querySelectorAll(".delete-user-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const userId = e.target.dataset.id;
                const token = localStorage.getItem("token");

                try {
                    await fetch(`https://final-project-afz0.onrender.com/api/auth/users/${userId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    loadAllUsers();
                } catch (error) {
                    console.error("Error deleting user:", error);
                }
            });
        });
    };

    if (productList) {
        loadProducts();
    }
});
