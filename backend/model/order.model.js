import mongoose from "mongoose";

const orderModel = new mongoose.Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    tableNumber: {
        type: Number,
        required: true,
    },
    items: [{
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Items",
            required: true,
        },
        nameAtOrder: {
            type: String,
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        priceAtOrder: {
            type: Number,
            required: true,
        },
    }],
    cGst : {
        type: Number,
        required: true,
        min: 0,
    },
    sGst : {
        type: Number,
        required: true,
        min: 0,
    },
    serviceCharge: {
        type: Number,
        min: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    payment: [{
        method: {
            type: String,
            enum: ["cash", "card", "upi", "not selected"],
            default: "not selected",
        },
        status: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
    }],
    transactionId: {
        type: String,
        unique: true,
        sparse: true
    },
    paidAt: Date,
    status: {
        type: String,
        enum: ["pending", "accepted", "preparing", "ready", "served", "cancelled"],
        default: "pending",
    },
}, {
    timestamps: true,
});

export default mongoose.model("Orders", orderModel);