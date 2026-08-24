import reservationModel from "../model/reservation.model.js";
import jwt from "jsonwebtoken";

export const bookReservation = async (req, res) => {
  try {
    const { name, email, phone, date, time, person } = req.body;

    if (!name || !email || !date || !time || !person) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await reservationModel.findOne({ date, time });

    if (existing) {
      return res.status(400).json({ message: "Slot already booked" });
    }

    const newReservation = new reservationModel({
      user: req.user?.userId,
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

export const getReservationByUserToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1] || req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.user = decoded;

    if (!req.user.userId) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const reservations = await reservationModel.find({ user: req.user.userId });

    res.status(200).json({ data: reservations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const fetchReservationById = async (req, res) => {
  try {
    const { id } = req.params;
    const reservation = await reservationModel.findById(id);
    res.status(200).json({ data: reservation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await reservationModel.find().sort({ date: 1 });
    res.status(200).json({ data: reservations });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getReservationStats = async (req, res) => {
  try {
    const totalReservations = await reservationModel.countDocuments();
    const confirmedReservations = await reservationModel.countDocuments({ status: "confirmed" });
    const cancelledReservations = await reservationModel.countDocuments({ status: "cancelled" });
    const pendingReservations = await reservationModel.countDocuments({ status: { $in: ["pending", undefined] } });

    res.status(200).json({
      data: {
        totalReservations,
        confirmedReservations,
        cancelledReservations,
        pendingReservations,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, date, time, person, status } = req.body;

    if (
      name === undefined &&
      email === undefined &&
      phone === undefined &&
      date === undefined &&
      time === undefined &&
      person === undefined &&
      status === undefined
    ) {
      return res.status(400).json({ message: "No fields provided" });
    }

    const reservation = await reservationModel.findById(id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    // ❗ Handle cancel
    if (status === "cancelled") {
      reservation.status = "cancelled";
      await reservation.save();

      return res.status(200).json(reservation);
    }

    // ✅ Validate time (your requirement)
    if (date && time) {
      const now = new Date();

      const [y, m, d] = date.split("-").map(Number);
      const selectedDate = new Date(y, m - 1, d);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate.getTime() === today.getTime()) {
        const [h, min] = time.split(":").map(Number);

        const selectedDateTime = new Date();
        selectedDateTime.setHours(h, min, 0, 0);

        if (selectedDateTime < now) {
          return res.status(400).json({
            message: "Cannot select past time for today",
          });
        }
      }
    }

    // ✅ Validate person
    if (person !== undefined && person < 1) {
      return res.status(400).json({ message: "Invalid guest count" });
    }

    // ✅ Update fields
    if (name !== undefined) reservation.name = name;
    if (email !== undefined) reservation.email = email;
    if (phone !== undefined && phone !== null && phone.trim() !== "") {
      reservation.phone = phone;
    }
    if (date !== undefined) reservation.date = date;
    if (time !== undefined) reservation.time = time;
    if (person !== undefined) reservation.person = person;

    await reservation.save();

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};