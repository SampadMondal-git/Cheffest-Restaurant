import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from '../components/global/navbar'
import Home from '../pages/Home'
import About from '../pages/About'
import Menu from '../pages/Menu'
import Reservation from '../pages/Reservation'
import Contact from '../pages/Contact'
import Login from '../pages/Login'
import ForgotPassword from '../components/global/forgot-password'
import OrderConfirmation from '../components/global/orderConfirmation'
import BookingConfirmation from '../components/global/bookingConfirmation'
import FeedbackConfirmation from '../components/global/feedbackConfirmation'
import ItemDetails from '../pages/itemDetails'
import Footer from '../components/global/footer'
function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reservation" element={<Reservation/>} />
                <Route path="/contact" element={<Contact/>} />
                <Route path="/login" element={<Login/>} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/feedback-confirmation" element={<FeedbackConfirmation />} />
                <Route path="/*" element={<ItemDetails />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}

export default App