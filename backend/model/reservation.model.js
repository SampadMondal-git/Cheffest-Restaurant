import mongoose from "mongoose";

const reservationModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    name: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: {
        type: String,
        required: false,
    },
    date: {
        type: String,
        require: true,
    },
    time: {
        type: String,
        require: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    person: {
        type: Number,
        require: true,
        min: 1,
        max: 20,
    },
    status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active",
    },
}, {
    timestamps: true,
});

export default mongoose.model("Reservations", reservationModel);