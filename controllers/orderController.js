const Order = require("../models/Order");
const Product = require("../models/Product");

// Создание заказа (Create)
exports.createOrder = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ error: "No products provided" });
    }

    const productIds = products.map(p => p.productId);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    if (dbProducts.length !== products.length) {
      return res.status(400).json({ error: "Some products not found" });
    }

    let totalPrice = 0;
    products.forEach(p => {
      const product = dbProducts.find(prod => prod._id.toString() === p.productId);
      totalPrice += product.price * p.quantity;
    });

    const newOrder = new Order({ userId: req.user.userId, products, totalPrice });
    await newOrder.save();
    res.status(201).json({ message: "Order created successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error creating order" });
  }
};

// Получение заказов пользователя (Read)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate("products.productId", "name price image");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Удаление заказа (Delete)
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({ _id: id, userId: req.user.userId });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};

exports.getOrderById = async (req, res) => {
    try {
      const { id } = req.params;
      const order = await Order.findOne({ _id: id, userId: req.user.userId })
        .populate("products.productId", "name price image");
  
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
  
      res.json(order);
    } catch (err) {
      res.status(500).json({ error: "Error fetching order" });
    }
  };
