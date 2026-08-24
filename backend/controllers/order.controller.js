import mongoose from "mongoose";
import orderModel from "../model/order.model.js";
import itemModel from "../model/item.model.js";
import generateOrderNumber from "../utils/generateOrderNumber.js";

export const getOrder = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await orderModel.findById(req.params.id);
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrderByUserId = async (req, res) => {
  try {
    const orders = await orderModel.find({ user: req.user.userId }).populate("items.item");
    res.status(200).json({ data: orders });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const totalOrders = await orderModel.countDocuments();
    const pendingOrders = await orderModel.countDocuments({ status: "pending" });
    const acceptedOrders = await orderModel.countDocuments({ status: "accepted" });
    const preparingOrders = await orderModel.countDocuments({ status: "preparing" });
    const readyOrders = await orderModel.countDocuments({ status: "ready" });
    const servedOrders = await orderModel.countDocuments({ status: "served" });
    const cancelledOrders = await orderModel.countDocuments({ status: "cancelled" });

    // Get recent orders (last 10)
    const recentOrders = await orderModel.find().sort({ createdAt: -1 }).limit(10).populate("user");

    // Calculate total revenue (only served orders)
    const servedOrdersData = await orderModel.find({ status: "served" });
    const totalRevenue = servedOrdersData.reduce((acc, order) => acc + order.totalAmount, 0);

    res.status(200).json({
      data: {
        totalOrders,
        pendingOrders,
        acceptedOrders,
        preparingOrders,
        readyOrders,
        servedOrders,
        cancelledOrders,
        totalRevenue,
        recentOrders,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addOrder = async (req, res) => {
  try {
    const { items, tableNumber, orderType, paymentMethod } = req.body;
    const user = req.user.userId;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items must be a non empty array" });
    }

    for (const i of items) {
      if (!mongoose.Types.ObjectId.isValid(i.item)) {
        return res.status(400).json({ message: "Invalid item id" });
      }

      if (!Number.isInteger(i.quantity) || i.quantity <= 0) {
        return res.status(400).json({ message: "Invalid quantity" });
      }
    }

    if (!Number.isInteger(tableNumber) || tableNumber <= 0) {
      return res.status(400).json({
        message: "Invalid table number"
      });
    }

    const itemIds = items.map(i => i.item);

    const existingItems = await itemModel.find({
      _id: { $in: itemIds }
    });

    if (existingItems.length !== itemIds.length) {
      return res.status(400).json({ message: "One or more items do not exist" });
    }

    const itemMap = new Map(existingItems.map(item => [item._id.toString(), item]));

    const itemsWithPrice = items.map(i => {
      const dbItem = itemMap.get(i.item.toString());

      if (!dbItem) {
        throw new Error("Item not found");
      }

      return {
        item: i.item,
        nameAtOrder: dbItem.name,
        quantity: i.quantity,
        priceAtOrder: dbItem.price
      };
    });

    const totalAmount = itemsWithPrice.reduce((acc, i) => acc + i.priceAtOrder * i.quantity, 0);

    const gstRate = 0.05;
    const cGst = +(totalAmount * (gstRate / 2)).toFixed(2);
    const sGst = +(totalAmount * (gstRate / 2)).toFixed(2);

    const serviceChargeRate = 0.10;
    const serviceCharge = +(totalAmount * serviceChargeRate).toFixed(2);

    const finalAmount = +(totalAmount + cGst + sGst + serviceCharge).toFixed(2);

    let orderNumber;

    try {
      orderNumber = await generateOrderNumber();

      while (await orderModel.exists({ orderNumber })) {
        orderNumber = await generateOrderNumber();
      }

    } catch (error) {
      console.error("Error generating order number:", error);
      return res.status(500).json({
        message: "Failed to generate order number"
      });
    }

    const newOrder = await orderModel.create({
      orderNumber,
      user,
      tableNumber,
      items: itemsWithPrice,
      cGst,
      sGst,
      serviceCharge,
      totalAmount: finalAmount,
      payment: [{ method: paymentMethod || 'cash', status: 'paid' }],
      orderType: orderType || 'dine-in',
      // ...(payment.status === "paid" && {
      //   paidAt: new Date().toISOString(),
      // }),
      transactionId: new mongoose.Types.ObjectId().toString()
    });

    res.status(201).json({
      message: "Order created successfully",
      data: newOrder
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const manageOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate status
    const validStatuses = ["pending", "accepted", "preparing", "ready", "served", "cancelled"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }

    // Find and update the order
    const order = await orderModel.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      message: "Order status updated successfully",
      data: order
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const cancelUserOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You are not authorized to cancel this order" });
    }

    if (order.status !== "pending") {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    order.status = "cancelled";
    await order.save();

    res.status(200).json({
      message: "Order cancelled successfully",
      data: order
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const manageOrderPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, method } = req.body;

    // Validate order ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    // Validate status against schema enums
    const validStatuses = ["pending", "paid", "failed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be one of: " + validStatuses.join(", ") });
    }

    const validMethods = ["cash", "card", "upi", "not selected"];
    if (method && !validMethods.includes(method)) {
      return res.status(400).json({ message: "Invalid payment method. Must be one of: " + validMethods.join(", ") });
    }

    if (status === "paid") {
      const validPaidMethods = ["cash", "card", "upi"];
      if (!method || !validPaidMethods.includes(method)) {
        return res.status(400).json({ message: "Payment method must be cash, card, or upi when marking an order as paid" });
      }
    }

    // Find the order
    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only update payment status (cashier should call this endpoint)
    // Ensure payment is an array; update first payment object or push a new one
    if (!Array.isArray(order.payment) || order.payment.length === 0) {
      order.payment = [{ status, method: method || "not selected" }];
    } else {
      order.payment[0].status = status;
      if (method) {
        order.payment[0].method = method;
      }
    }

    // Set paidAt when status is paid, clear otherwise
    if (status === "paid") {
      order.paidAt = new Date();
      if (!order.transactionId) {
        order.transactionId = new mongoose.Types.ObjectId().toString();
      }
    } else {
      order.paidAt = undefined;
    }

    await order.save();

    res.status(200).json({
      message: "Order payment status updated successfully",
      data: order
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};