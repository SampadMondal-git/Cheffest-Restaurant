import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware.js";
import { addFeedback } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/add-feedback", verifyJWT, addFeedback); // chunks route

export default router;