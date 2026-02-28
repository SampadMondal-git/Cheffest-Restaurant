import express from 'express'
import { postReview, deleteReview } from '../controllers/review.controller.js'
import verifyJWT from '../middleware/verifyJWT.middleware.js'

const router = express.Router()

router.post("/:itemId", verifyJWT, postReview ) // chunks route

router.delete("/:reviewId", verifyJWT, deleteReview ) // chunks route

export default router