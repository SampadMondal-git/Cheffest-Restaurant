import feedbackModel from "../model/feedback.model.js";

export const addFeedback = async (req, res) => {
    try {
        const { name, email, subject, phone, message } = req.body;

        if (!name || !email || !subject || !phone || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const feedback = new feedbackModel({
            name,
            email,
            subject,
            phone,
            message,
        });

        await feedback.save();
        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};