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
    const profilePopup = document.getElementById("profile-popup");
    const profileEmailPopup = document.getElementById("popup-profile-email");
    const updateProfilePopupBtn = document.getElementById("update-profile-btn");
    const closePopup = document.querySelector(".close-popup");

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

    const token = localStorage.getItem("token");
    const userEmail = localStorage.getItem("userEmail");
    const userRole = localStorage.getItem("userRole");

    if (token && userEmail) {
        authForm.style.display = "none";
        loginBtn.style.display = "none";
        logoutBtn.style.display = "inline-block";
        userDisplay.innerHTML = `<strong class="profile-trigger">👤 ${userEmail} (${userRole})</strong>`;

        if (userRole === "admin") {
            adminPanel.style.display = "block";
            await loadUsers();
        }

        await loadUserProfile();
    }

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        setTimeout(() => {
            location.href = "index.html";
        }, 100);
    });

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

    userDisplay.addEventListener("click", () => {
        if (token) {
            loadUserProfile();
            profilePopup.style.display = "flex";
        }
    });

    closePopup.addEventListener("click", () => {
        profilePopup.style.display = "none";
    });

    updateProfilePopupBtn.addEventListener("click", async () => {
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
            localStorage.setItem("userEmail", newEmail);
            loadUserProfile();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });

    async function loadUserProfile() {
        try {
            const response = await fetch("https://final-project-afz0.onrender.com/api/auth/profile", {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (!response.ok) throw new Error("Failed to fetch profile");

            const user = await response.json();
            profileEmailPopup.innerText = `Email: ${user.email}`;
        } catch (error) {
            console.error("Error loading profile:", error);
        }
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
});
