document.addEventListener("DOMContentLoaded", async () => {
    const API_URL = "https://final-project-afz0.onrender.com"; // URL API

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
    const orderList = document.getElementById("order-list");

    let isLogin = true;

    // Переключение между логином и регистрацией
    if (toggleRegister) {
        toggleRegister.addEventListener("click", (e) => {
            e.preventDefault();
            isLogin = !isLogin;
            authTitle.textContent = isLogin ? "Login" : "Register";
            submitAuth.textContent = isLogin ? "Login" : "Register";
            toggleRegister.innerHTML = isLogin
                ? "Don't have an account? <a href='#'>Register here</a>"
                : "Already have an account? <a href='#'>Login here</a>";
        });
    }

    // Проверка токена и отображение пользователя
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");

    if (token && userEmail) {
        if (authForm) authForm.style.display = "none";
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        if (userDisplay) userDisplay.innerHTML = `<strong>👤 ${userEmail}</strong>`;
    }

    // Выход из системы
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            localStorage.removeItem("userEmail");
            location.reload();
        });
    }

    // Авторизация/регистрация
    if (submitAuth) {
        submitAuth.addEventListener("click", async () => {
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            if (!email || !password) {
                alert("Please enter both email and password.");
                return;
            }

            const url = isLogin ? `${API_URL}/api/login` : `${API_URL}/api/register`;

            try {
                const response = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                if (response.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("userEmail", email);
                    window.location.href = "index.html";
                } else {
                    alert(data.error || "Authentication failed.");
                }
            } catch (error) {
                console.error("Auth error:", error);
                alert("Server error. Please try again later.");
            }
        });
    }

    // Загрузка товаров
    const loadProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
            const products = await response.json();

            if (!productList) return;
            productList.innerHTML = ""; // Очистка списка перед добавлением новых товаров

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
                productList.appendChild(productCard);
            });

            attachBuyButtons();
        } catch (error) {
            console.error("Error fetching products:", error);
            productList.innerHTML = "<p>Failed to load products.</p>";
        }
    };

    // Покупка товаров
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
                        const orderResponse = await fetch(`${API_URL}/api/orders`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`
                            },
                            body: JSON.stringify({
                                products: [{ productId, quantity: 1 }]
                            })
                        });

                        const orderData = await orderResponse.json();
                        if (orderResponse.ok) {
                            alert("✅ Order placed successfully!");
                        } else {
                            alert(orderData.error || "❌ Order failed!");
                        }
                    } catch (error) {
                        console.error("Error placing order:", error);
                        alert("Error placing order. Please try again.");
                    }
                }
            });
        });
    };

    // Загрузка заказов
    const loadOrders = async () => {
        if (!orderList) return;

        try {
            const response = await fetch(`${API_URL}/api/orders`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const orders = await response.json();

            orderList.innerHTML = ""; // Очистка списка заказов перед загрузкой

            if (!orders.length) {
                orderList.innerHTML = "<p>No orders found.</p>";
                return;
            }

            orders.forEach(order => {
                const orderCard = document.createElement("div");
                orderCard.classList.add("order-card");
                orderCard.innerHTML = `
                    <h3>Order ID: ${order._id}</h3>
                    <p>Total Price: $${order.totalPrice}</p>
                    <button class="delete-btn" data-id="${order._id}">Cancel Order</button>
                `;
                orderList.appendChild(orderCard);
            });

            attachDeleteButtons();
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    };

    // Удаление заказа
    const attachDeleteButtons = () => {
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const orderId = e.target.dataset.id;
                console.log("Attempting to delete order:", orderId); // Лог для отладки
                const deleteResponse = await fetch(`${API_URL}/api/orders/${orderId}`, {
                    method: "DELETE",
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const deleteData = await deleteResponse.json();
                if (deleteResponse.ok) {
                    alert("Order cancelled!");
                    window.location.reload();
                } else {
                    alert(deleteData.error || "Failed to cancel order.");
                }
            });
        });
    };

    // Инициализация функций
    if (productList) {
        loadProducts();
    }
    if (orderList) {
        loadOrders();
    }
});
