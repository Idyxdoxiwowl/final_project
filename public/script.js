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
    const addProductBtn = document.getElementById("add-product-btn");
    
    let isLogin = true;

    // Переключение между входом и регистрацией
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
        }
        loadProducts();
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
        if (!productList) return;
        try {
            const response = await fetch(`https://final-project-afz0.onrender.com/api/products`);
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
                    <img src="${product.image || 'placeholder.jpg'}" alt="${product.name || 'Unnamed Product'}">
                    <h3>${product.name || 'Unnamed Product'}</h3>
                    <p>${product.description || 'No description available'}</p>
                    <span>$${product.price || 'N/A'}</span>
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

                if (confirm("Do you want to confirm your order?")) {
                    try {
                        const orderResponse = await fetch(`https://final-project-afz0.onrender.com/api/orders`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                            body: JSON.stringify({ products: [{ productId, quantity: 1 }] })
                        });

                        const orderData = await orderResponse.json();
                        if (orderResponse.ok) {
                            alert("✅ Order placed successfully!");
                        } else {
                            alert(orderData.error || "❌ Order failed!");
                        }
                    } catch (error) {
                        console.error("Error placing order:", error);
                    }
                }
            });
        });
    };

    const attachDeleteButtons = () => {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                const token = localStorage.getItem("token");
                if (!token || localStorage.getItem("userRole") !== "admin") {
                    alert("Only admin can delete products!");
                    return;
                }

                if (confirm("Are you sure you want to delete this product?")) {
                    try {
                        const response = await fetch(`https://final-project-afz0.onrender.com/api/products/${productId}`, {
                            method: "DELETE",
                            headers: { "Authorization": `Bearer ${token}` }
                        });
                        if (response.ok) loadProducts();
                    } catch (error) {
                        console.error("Error deleting product:", error);
                    }
                }
            });
        });
    };
});
