import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware.js";
import isAdmin from "../middleware/isAdmin.middleware.js";
import allowRoles from "../middleware/role.middleware.js";
import { getOrder, getOrderById, getOrderByUserId, addOrder, manageOrder, manageOrderPayment, getOrderStats } from "../controllers/order.controller.js";

const router = express.Router();

router.get("/get-all-orders", verifyJWT, allowRoles("admin", "head-chef"), getOrder);

router.get("/get-order/:id", allowRoles("admin", "head-chef", "manager"), getOrderById);

router.get("/get-order-by-user-id", verifyJWT, getOrderByUserId);

router.get("/get-order-stats", isAdmin, getOrderStats);

router.post("/add-order", verifyJWT, addOrder);

router.patch("/manage-order/:id", verifyJWT, allowRoles("admin", "head-chef"), manageOrder);

router.patch("/manage-order-payment/:id", verifyJWT, allowRoles("admin", "cashier"), manageOrderPayment);

export default router;