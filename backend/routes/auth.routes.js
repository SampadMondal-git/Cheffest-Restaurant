import express from "express";
import {signup, login, logout, forgotPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup); // chunks route

router.post("/login", login) // chunks route

router.post("/logout", logout) // chunks route

router.post("/forgot-password", forgotPassword) // chunks route

export default router