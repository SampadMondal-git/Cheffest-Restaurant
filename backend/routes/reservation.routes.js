import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import { bookReservation, getReservationByUserToken, fetchReservationById, updateReservation, getAllReservations, getReservationStats } from "../controllers/reservation.controller.js";

const router = express.Router();

router.post("/add-reservation", verifyJWT, bookReservation); // chunks route

router.get("/get-reservation-by-user", verifyJWT, getReservationByUserToken); // chunks route

router.get("/get-all-reservations", isAdmin, getAllReservations); // Admin only

router.get("/get-reservation-stats", isAdmin, getReservationStats); // Admin only

router.get("/fetch-reservation-by-id/:id", verifyJWT, fetchReservationById);

router.patch("/update-reservation/:id", verifyJWT, updateReservation);

export default router;