import mongoose from "mongoose";

const reviewModel = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
    },
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Items",
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: {
        type: String,
        trim: true,
    },
}, {
    timestamps: true,
});

export default mongoose.model("Review", reviewModel);