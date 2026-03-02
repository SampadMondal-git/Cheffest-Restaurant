import express from 'express'
import { postItems, updateItems, deleteItems } from '../controllers/item.controller.js'
import verifyJWT from '../middleware/verifyJWT.middleware.js'

const router = express.Router()

router.post("/add-item", verifyJWT, postItems ) // chunks route

router.put("/update-item/:id", verifyJWT, updateItems ) // chunks route

router.delete("/delete-item/:id", verifyJWT, deleteItems ) // chunks route

export default router