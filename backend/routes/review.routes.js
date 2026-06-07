import express from 'express'
import { postReview, deleteReview, getReviewsByItemId } from '../controllers/review.controller.js'
import verifyJWT from '../middleware/verifyJWT.middleware.js'

const router = express.Router()

router.get("/:itemId", getReviewsByItemId ) // get reviews by item ID

router.post("/:itemId", verifyJWT, postReview ) // add review

router.delete("/:reviewId", verifyJWT, deleteReview ) // delete review

export default router