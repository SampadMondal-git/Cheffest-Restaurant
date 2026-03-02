import reservationModel from "../model/reservation.model.js";

export const bookReservation = async (req, res) => {
    try {
        const { name, email, phone, date, time, person } = req.body;

        if (!name || !email || !phone || !date || !time || !person) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const newReservation = new reservationModel({
            name,
            email,
            phone,
            date,
            time,
            person,
        });

        await newReservation.save();

        res.status(201).json({ message: "Reservation created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};