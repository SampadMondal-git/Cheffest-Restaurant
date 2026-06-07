import mongoose from "mongoose";

const contactModel = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    userType: {
        type: String,
        default: "customer",
        enum: ["customer", "staff", "manager", "admin", "head-chef", "guest"],
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    subject: {
        type: String,
    },
    phone: {
        type: String,
    },
    message: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Contact", contactModel);