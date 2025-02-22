const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    products: [{ productId: mongoose.Schema.Types.ObjectId, quantity: Number }],
    totalPrice: Number
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
