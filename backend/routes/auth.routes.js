import express from "express";
import {signup, login, logout, forgotPassword, validateToken, resetPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup); // chunks route

router.post("/login", login) // chunks route

router.post("/logout", logout) // chunks route

router.post("/forgot-password", forgotPassword) // chunks route

router.get("/validate-token/:token", validateToken) // chunks route

router.post("/reset-password", resetPassword) // chunks route

export default router