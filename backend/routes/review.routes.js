import express from 'express'
import { postReview } from '../controllers/review.controller.js'
import verifyJWT from '../middleware/verifyJWT.middleware.js'

const router = express.Router()

router.post("/:itemId", verifyJWT, postReview ) // chunks route

export default router