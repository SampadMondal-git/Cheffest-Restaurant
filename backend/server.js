import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import authRoute from './routes/auth.routes.js'
import itemsRoute from './routes/item.routes.js'
import postReview from './routes/review.routes.js'
import postFeedback from './routes/feedback.routes.js'
import bookReservation from './routes/reservation.routes.js'
import orderRoute from './routes/order.routes.js'
import manageUser from './routes/manageUser.routes.js'
import postContact from './routes/contact.routes.js'

import connectDB from './db/database.js'
import {
    generalLimiter,
    authLimiter,
    forgotPasswordLimiter,
    contactFormLimiter,
    feedbackLimiter,
    reviewLimiter
} from './middleware/rateLimit.middleware.js'

import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config()

const PORT = process.env.PORT || 5000

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
}))

// Body parsing middleware (must come before route handlers)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())

// Apply general rate limiter to all routes
app.use(generalLimiter)

app.use('/', authRoute) // Auth base route
app.use('/items', itemsRoute) // Items base route
app.use('/reviews', reviewLimiter, postReview) // Reviews base route with stricter limit
app.use('/feedback', feedbackLimiter, postFeedback) // Feedback base route with stricter limit
app.use('/reservation', bookReservation) // Reservation base route
app.use('/order', orderRoute) // Order base route
app.use('/user', manageUser) // User base route
app.use('/contact', contactFormLimiter, postContact) // Contact base route with stricter limit

app.get('/', (req, res) => {
    res.send("Hello from the backend")
})

app.listen(PORT, () => {
    connectDB();
    console.log(`Server started on port ${PORT}`);
})