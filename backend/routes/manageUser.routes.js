import express from "express";
import { createUser, getAllUsers, manageUser, deleteUser } from "../controllers/manageUser.controller.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const router = express.Router();

router.get("/get-all-users", isAdmin, getAllUsers);

router.post("/create-user", isAdmin, createUser); // chunks route

router.patch("/manage-user/:id", isAdmin, manageUser); // chunks route

router.delete("/delete-user/:id", isAdmin, deleteUser); // chunks route

export default router;