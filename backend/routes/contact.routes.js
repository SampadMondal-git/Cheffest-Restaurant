import express from "express";
import { postContact, getAllContacts } from "../controllers/contact.controller.js";
import allowRoles from "../middleware/role.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";

const router = express.Router();

router.post("/add-contact", allowRoles("guest", "customer", "admin", "manager"), postContact); // chunks route

router.get("/get-all-contacts", isAdmin, getAllContacts); // Admin only

export default router;