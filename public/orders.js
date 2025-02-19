document.addEventListener("DOMContentLoaded", async () => {
    const orderList = document.getElementById("order-list");
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        alert("Please log in to see your orders.");
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/orders/${userEmail}`);
        const orders = await response.json();

        orders.forEach(order => {
            const orderCard = document.createElement("div");
            orderCard.classList.add("order-card");
            orderCard.innerHTML = `
                <h3>Order ID: ${order._id}</h3>
                <p>Product: ${order.productName}</p>
                <p>Quantity: ${order.quantity}</p>
                <span>Total Price: $${order.totalPrice}</span>
                <button class="delete-btn" data-id="${order._id}">Cancel Order</button>
            `;
            orderList.appendChild(orderCard);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", async (e) => {
                const orderId = e.target.dataset.id;
                const deleteResponse = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                    method: "DELETE"
                });

                const deleteData = await deleteResponse.json();
                if (deleteData.message) {
                    alert("Order cancelled!");
                    window.location.reload();
                } else {
                    alert("Failed to cancel order.");
                }
            });
        });

    } catch (error) {
        console.error("Error fetching orders:", error);
    }
});
