import mongoose from "mongoose";

const reservationModel = new mongoose.Schema({
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
        require: true,
    },
    date: {
        type: Date,
        require: true,
    },
    time: {
        type: String,
        require: true,
        match:/^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    person: {
        type: Number,
        require: true,
        min: 1,
        max: 20,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Reservations", reservationModel);