import express from "express";
import {signup, login, logout, forgotPassword, validateToken, resetPassword, getUserDetailsByToken, updateUserDetailsByToken } from "../controllers/auth.controller.js";
import verifyJWT from "../middleware/verifyJWT.middleware.js";

const router = express.Router();

router.post("/signup", signup); // chunks route

router.post("/login", login) // chunks route

router.post("/logout", logout) // chunks route

router.post("/forgot-password", forgotPassword) // chunks route

router.get("/validate-token/:token", validateToken) // chunks route

router.post("/reset-password/:token", resetPassword) // chunks route

router.get("/user-details", getUserDetailsByToken) // chunks route

router.patch("/update-user-details", verifyJWT, updateUserDetailsByToken) // chunks route

export default router