import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from '../components/global/navbar'
import Footer from '../components/global/footer'
import { CartProvider } from './contexts/CartContext';
import CartPopup from '../components/global/CartPopup';
import { ConfirmationProvider } from './contexts/ConfirmationContext';
import { AuthProvider } from './contexts/AuthContext';
import Loader from '../components/global/loader';

const Home = lazy(() => import('../pages/Home'));
const About = lazy(() => import('../pages/About'));
const Menu = lazy(() => import('../pages/Menu'));
const AllItems = lazy(() => import('../pages/AllItems'));
const Reservation = lazy(() => import('../pages/Reservation'));
const Contact = lazy(() => import('../pages/Contact'));
const Signup = lazy(() => import('../pages/Signup'));
const Login = lazy(() => import('../pages/Login'));
const ForgotPassword = lazy(() => import('../components/global/forgot-password'));
const ResetPassword = lazy(() => import('../components/global/resetPassword'));
const OrderConfirmation = lazy(() => import('../components/global/orderConfirmation'));
const BookingConfirmation = lazy(() => import('../components/global/bookingConfirmation'));
const FeedbackConfirmation = lazy(() => import('../components/global/feedbackConfirmation'));
const ErrorPage = lazy(() => import('../pages/errorPage'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const RevenueDashboard = lazy(() => import('../components/dashboard/RevenueDashboard'));
const CashierDashboard = lazy(() => import('../pages/CashierDashboard'));
const HeadChefDashboard = lazy(() => import('../pages/HeadChefDashboard'));
const ManageItems = lazy(() => import('../components/dashboard/manageItems'));
const Profile = lazy(() => import('../components/user/profile'));
const GetReservationByUserToken = lazy(() => import('../components/user/reservation'));
const ReservationDetails = lazy(() => import('../components/user/reservationDetails'));
const GetOrderByUserId = lazy(() => import('../components/user/order'));
const ManageOrders = lazy(() => import('../components/dashboard/manageOrders'));
const Users = lazy(() => import('../components/dashboard/manageUsers'));
const ManageReservation = lazy(() => import('../components/dashboard/manageReservation'));
const ConfirmationModal = lazy(() => import('../components/global/ConfirmationModal'));

function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname, search]);

    return null;
}

function App() {
    return (
        <BrowserRouter>
            <ScrollToTop />
            <AuthProvider>
                <ConfirmationProvider>
                    <CartProvider>
                        <Navbar />
                        <CartPopup />
                        <ConfirmationModal />
                        <main className="w-full overflow-x-hidden">
                            <Suspense fallback={<Loader fullPage message="Preparing your experience..." />}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/about" element={<About />} />
                                    <Route path="/menu" element={<Menu />} />
                                    <Route path="/our-menu" element={<AllItems />} />
                                    <Route path="/reservation" element={<Reservation />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/signup" element={<Signup />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                                    <Route path="/order-confirmation" element={<OrderConfirmation />} />
                                    <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                                    <Route path="/feedback-confirmation" element={<FeedbackConfirmation />} />
                                    <Route path="/*" element={<ErrorPage />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/revenue-dashboard" element={<RevenueDashboard />} />
                                    <Route path="/manage-items" element={<ManageItems />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/reservations" element={<GetReservationByUserToken />} />
                                    <Route path="/reservations/:id" element={<ReservationDetails />} />
                                    <Route path="/orders" element={<GetOrderByUserId />} />
                                    <Route path="/manage-orders" element={<ManageOrders />} />
                                    <Route path="/cashier-dashboard" element={<CashierDashboard />} />
                                    <Route path="/headchef-dashboard" element={<HeadChefDashboard />} />
                                    <Route path="/users" element={<Users />} />
                                    <Route path="/manage-reservations" element={<ManageReservation />} />
                                </Routes>
                            </Suspense>
                        </main>
                        <Footer />
                    </CartProvider>
                </ConfirmationProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}

export default App