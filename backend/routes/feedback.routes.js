import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import { addFeedback, getAllFeedback } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/add-feedback", verifyJWT, addFeedback); // chunks route

router.get("/get-all-feedback", isAdmin, getAllFeedback); // Admin only

export default router;