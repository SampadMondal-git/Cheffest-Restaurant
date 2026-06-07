import express from 'express'
import { getAllItems, postItems, updateItems, deleteItems } from '../controllers/item.controller.js'
import isAdmin from '../middleware/isAdmin.middleware.js'
import upload from '../middleware/upload.middleware.js'

const router = express.Router()

router.get("/get-all-items", getAllItems)

router.post("/add-item", isAdmin, upload.array("images", 5), postItems ) // chunks route

router.patch("/update-item/:id", isAdmin, upload.array("images", 5), updateItems ) // chunks route

router.delete("/delete-item/:id", isAdmin, deleteItems ) // chunks route

export default router