import express from 'express'
import { postItems } from '../controllers/item.controller.js'
import verifyJWT from '../middleware/verifyJWT.middleware.js'

const router = express.Router()

router.post("/add-item", verifyJWT, postItems ) // chunks route

export default router