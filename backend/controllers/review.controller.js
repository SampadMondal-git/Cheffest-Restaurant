import Review from "../model/review.model.js";
import Item from "../model/item.model.js";

export const postReview = async (req, res) => {
    try {
        const userId = req.user && req.user.userId;

        const { rating, comment } = req.body;

        const { itemId } = req.params;

        if (!rating) {
            return res.status(400).json({ message: "Rating is required and must be a number between 1 and 5." });
        }

        const review = new Review({
            user: userId,
            item: itemId,
            rating,
            comment,
        });

        await review.save();

        const reviews = await Review.find({ item: itemId });

        const total = reviews.reduce((acc, r) => acc + r.rating, 0);

        const average = reviews.length ? (total / reviews.length).toFixed(2) : "0.00";

        await Item.findByIdAndUpdate(itemId, {
            averageRating: average,
            reviewCount: reviews.length,
        });

        res.status(201).json({ message: "Review added", averageRating: average });
    } catch {
        console.error("Post review error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};