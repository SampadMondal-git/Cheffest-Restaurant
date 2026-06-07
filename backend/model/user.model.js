import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
    },
    role: {
        type: String,
        enum: ["customer", "staff", "manager", "admin", "head-chef"],
        default: "customer",
    },
    position: {
        type: String,
        enum: ["line-cook", "prep-cook", "kitchen-assistant", "dishwasher", "cashier", "waiter", "cleaner", "host",],
        required: function () {
            return this.role === "staff";
        },
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps: true,
});

export default mongoose.model("Users", userSchema);