import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from '../components/global/navbar'
import Home from '../pages/Home'
import About from '../pages/About'
import Menu from '../pages/Menu'
import AllItems from '../pages/AllItems'
import Reservation from '../pages/Reservation'
import Contact from '../pages/Contact'
import Signup from '../pages/Signup'
import Login from '../pages/Login'
import ForgotPassword from '../components/global/forgot-password'
import ResetPassword from '../components/global/resetPassword'
import OrderConfirmation from '../components/global/orderConfirmation'
import BookingConfirmation from '../components/global/bookingConfirmation'
import FeedbackConfirmation from '../components/global/feedbackConfirmation'
import ErrorPage from '../pages/errorPage'
import Footer from '../components/global/footer'
import Dashboard from '../pages/Dashboard'
import ManageItems from '../components/dashboard/manageItems'
import Profile from '../components/user/profile'
import GetReservationByUserToken from '../components/user/reservation'
import ReservationDetails from '../components/user/reservationDetails'
import GetOrderByUserId from '../components/user/order'
import ManageOrders from '../components/dashboard/manageOrders'
import Users from '../components/dashboard/manageUsers'
import ManageReservation from '../components/dashboard/manageReservation'
import { CartProvider } from './contexts/CartContext';
import CartPopup from '../components/global/CartPopup';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import ConfirmationModal from '../components/global/ConfirmationModal';
import { AuthProvider } from './contexts/AuthContext';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ConfirmationProvider>
                    <CartProvider>
                        <Navbar />
                        <CartPopup />
                        <ConfirmationModal />
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/menu" element={<Menu />} />
                            <Route path="/our-menu" element={<AllItems />} />
                            <Route path="/reservation" element={<Reservation/>} />
                            <Route path="/contact" element={<Contact/>} />
                            <Route path="/signup" element={<Signup />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/forgot-password" element={<ForgotPassword/>} />
                            <Route path="/reset-password/:token" element={<ResetPassword/>} />
                            <Route path="/order-confirmation" element={<OrderConfirmation />} />
                            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                            <Route path="/feedback-confirmation" element={<FeedbackConfirmation />} />
                            <Route path="/*" element={<ErrorPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/manage-items" element={<ManageItems />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/reservations" element={<GetReservationByUserToken />} />
                            <Route path="/reservations/:id" element={<ReservationDetails />} />
                            <Route path="/orders" element={<GetOrderByUserId />} />
                            <Route path="/manage-orders" element={<ManageOrders />} />
                            <Route path="/users" element={<Users />} />
                            <Route path="/manage-reservations" element={<ManageReservation />} />
                        </Routes>
                        <Footer />
                    </CartProvider>
                </ConfirmationProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App