import express from "express";
import { postContact, getAllContacts } from "../controllers/contact.controller.js";
import allowRoles from "../middleware/role.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import { contactFormLimiter } from "../middleware/rateLimit.middleware.js";

const router = express.Router();

router.post("/add-contact", contactFormLimiter, allowRoles("guest", "customer", "admin", "manager"), postContact); // Contact submissions only

router.get("/get-all-contacts", isAdmin, getAllContacts); // Admin only

export default router;