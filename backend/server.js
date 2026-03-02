import express from 'express'
import dotenv from 'dotenv'
import authRoute from './routes/auth.routes.js'
import postItem from './routes/postItem.routes.js'
import postReview from './routes/review.routes.js'
import postFeedback from './routes/feedback.routes.js'
import bookReservation from './routes/reservation.routes.js'
import connectDB from './db/database.js'
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config()
const PORT = process.env.PORT || 5000

const app = express()

// Body parsing middleware (must come before route handlers)
app.use(express.json())

app.use('/api/auth', authRoute) // Auth base route
app.use('/api/products', postItem) // Items base route
app.use('/api/reviews', postReview) // Reviews base route
app.use('/api/feedback', postFeedback) // Feedback base route
app.use('/api/reservation', bookReservation) // Reservation base route

app.get('/', (req, res) => {
    res.send("Hello from the backend")
})

app.listen(PORT, () => {
    connectDB();
    console.log('Server started on port 5000')
})