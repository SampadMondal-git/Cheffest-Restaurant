import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from '../components/global/navbar'
import Home from '../pages/Home'
import About from '../pages/About'
import Menu from '../pages/Menu'
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

function App() {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");
        
        if (storedToken) {
            setToken(storedToken);
        }
        
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error("Failed to parse stored user:", error);
                localStorage.removeItem("user");
            }
        }
    }, []);

    const handleLogin = (newToken: string, userData: any) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));
        setToken(newToken);
        setUser(userData);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setToken(null);
        setUser(null);
    };
    return (
        <BrowserRouter>
            <Navbar token={token} user={user} onLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reservation" element={<Reservation/>} />
                <Route path="/contact" element={<Contact/>} />
                <Route path="/signup" element={<Signup onLogin={handleLogin} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/forgot-password" element={<ForgotPassword/>} />
                <Route path="/reset-password/:token" element={<ResetPassword/>} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/feedback-confirmation" element={<FeedbackConfirmation />} />
                <Route path="/*" element={<ErrorPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/items" element={<ManageItems />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reservations" element={<GetReservationByUserToken />} />
                <Route path="/reservations/:id" element={<ReservationDetails />} />
                <Route path="/orders" element={<GetOrderByUserId />} />
                <Route path="/manage-orders" element={<ManageOrders />} />
                <Route path="/users" element={<Users />} />
            </Routes>
            <Footer />
        </BrowserRouter>
    )
}

export default App