import express from "express";

import verifyJWT from "../middleware/verifyJWT.middleware.js";
import { bookReservation } from "../controllers/reservation.controller.js";

const router = express.Router();

router.post("/add-reservation", verifyJWT, bookReservation); // chunks route

export default router;