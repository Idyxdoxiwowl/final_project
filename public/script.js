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

    // Проверка токена и отображение пользователя
    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");

    if (token && userEmail) {
        authForm.style.display = "none";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userDisplay.innerHTML = `<strong>👤 ${userEmail}</strong>`;
    }

    // Выход из системы
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        location.reload();
    });

    // Авторизация/регистрация
    submitAuth.addEventListener("click", async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        const url = isLogin ? "https://final-project-afz0.onrender.com/api/login" : "https://final-project-afz0.onrender.com/api/register";

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

    // Загрузка товаров (ограничено 6 случайными)
    const loadProducts = async () => {
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/products");
            const products = await response.json();

            if (!productList) return;
            productList.innerHTML = ""; // Очищаем перед добавлением новых

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

    // Функция для обработки кнопок "Buy"
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
                        const orderResponse = await fetch("https://final-project-afz0.onrender.com/api/orders", {
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

    // Инициализация загрузки продуктов
    if (productList) {
        loadProducts();
    }
});

// Функция загрузки заказов и обработки удаления
const loadOrders = async () => {
    const orderList = document.getElementById("order-list");
    const token = localStorage.getItem("token");

    if (!token || !orderList) return;

    try {
        const response = await fetch("https://final-project-afz0.onrender.com/api/orders", {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const orders = await response.json();

        orderList.innerHTML = ""; // Очистка перед добавлением заказов

        if (orders.length === 0) {
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
        orderList.innerHTML = "<p>Failed to load orders.</p>";
    }
};

// Функция для обработки кнопок "Cancel Order"
const attachDeleteButtons = () => {
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (e) => {
            const orderId = e.target.dataset.id;
            const token = localStorage.getItem("token");

            if (!token) {
                alert("You need to log in to cancel an order!");
                return;
            }

            if (confirm("Are you sure you want to cancel this order?")) {
                try {
                    const deleteResponse = await fetch(`https://final-project-afz0.onrender.com/api/orders/${orderId}`, {
                        method: "DELETE",
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    const deleteData = await deleteResponse.json();
                    if (deleteResponse.ok) {
                        alert("✅ Order cancelled successfully!");
                        loadOrders(); // Обновляем список заказов после удаления
                    } else {
                        alert(deleteData.error || "❌ Failed to cancel order.");
                    }
                } catch (error) {
                    console.error("Error deleting order:", error);
                    alert("Error cancelling order. Please try again.");
                }
            }
        });
    });
};

// Загружаем заказы, если пользователь на странице orders.html
if (document.getElementById("order-list")) {
    loadOrders();
}
