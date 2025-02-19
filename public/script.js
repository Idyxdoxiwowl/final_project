document.addEventListener("DOMContentLoaded", async () => {
    const productList = document.getElementById("product-list");
    const loginBtn = document.getElementById("login-btn");
    const logoutBtn = document.getElementById("logout-btn");
    const authForm = document.getElementById("auth-form");
    const authTitle = document.getElementById("auth-title");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const submitAuth = document.getElementById("submit-auth");
    const toggleRegister = document.getElementById("toggle-register");
    const userDisplay = document.getElementById("user-info");

    let isLogin = true;

    toggleRegister.addEventListener("click", (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? "Login" : "Register";
        submitAuth.textContent = isLogin ? "Login" : "Register";
        toggleRegister.innerHTML = isLogin ? "Don't have an account? <a href='#'>Register here</a>" : "Already have an account? <a href='#'>Login here</a>";
    });

    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    if (token && userEmail) {
        authForm.style.display = "none";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userDisplay.innerHTML = `<strong>👤 ${userEmail}</strong>`;
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userEmail");
        location.reload();
    });

    submitAuth.addEventListener("click", async () => {
        const email = emailInput.value;
        const password = passwordInput.value;
        const url = isLogin ? "http://localhost:5000/api/login" : "http://localhost:5000/api/register";

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("userEmail", email);
            window.location.href = "index.html";
        } else {
            alert("Authentication failed");
        }
    });

    try {
        const response = await fetch("http://localhost:5000/api/products");
        const products = await response.json();

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

        document.querySelectorAll(".buy-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const productId = e.target.dataset.id;
                const userEmail = localStorage.getItem("userEmail");
                if (!userEmail) {
                    alert("You need to log in to place an order!");
                    return;
                }

                if (confirm("Do you want to confirm your order?")) {
                    const orderResponse = await fetch("http://localhost:5000/api/orders", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            userEmail,
                            productId,
                            quantity: 1
                        })
                    });

                    const orderData = await orderResponse.json();
                    if (orderData.message) {
                        alert("✅ Order placed successfully!");
                    } else {
                        alert("❌ Order failed!");
                    }
                }
            });
        });

    } catch (error) {
        console.error("Error fetching products:", error);
    }
});
