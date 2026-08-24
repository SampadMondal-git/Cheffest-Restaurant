import express from "express";
import verifyJWT from "../middleware/verifyJWT.middleware.js";
import { getCart, updateCart, clearCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/get-cart", verifyJWT, getCart);

router.patch("/update-cart", verifyJWT, updateCart);

router.patch("/clear-cart", verifyJWT, clearCart);

export default router;
