import React from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../api/manageUser";
import { getAllOrders } from "../api/manageOrder";
import { getAllReservations } from "../api/manageReservation";
import { getAllContacts, getAllFeedback } from "../api/adminDashboard";
import Loader from "../components/global/loader";
import { useAuth } from "../src/contexts/AuthContext";
// Premium SVG icons from lucide-react
import { Users, Utensils, ShoppingBag, Calendar, BarChart3 } from "lucide-react";

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  type Order = {
    id?: string;
    _id?: string;
    status: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    user?: string;
  };

  type Reservation = {
    id?: string;
    _id?: string;
    name: string;
    date: string;
    time: string;
    person: number;
    status?: string;
  };

  type Contact = {
    id?: string;
    _id?: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    createdAt?: string;
  };

  type Feedback = {
    id?: string;
    _id?: string;
    name: string;
    subject: string;
    message: string;
  };

  const [orders, setOrders] = React.useState<Order[]>([]);
  const [todayPendingOrders, setTodayPendingOrders] = React.useState(0);
  const [todayServedOrders, setTodayServedOrders] = React.useState(0);
  const [todayRevenue, setTodayRevenue] = React.useState(0);
  const [todayReservations, setTodayReservations] = React.useState<Reservation[]>([]);
  const [upcomingReservations, setUpcomingReservations] = React.useState<Reservation[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [feedback, setFeedback] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [userMap, setUserMap] = React.useState<Map<string, string>>(new Map());

  const [todayOrderBreakdown, setTodayOrderBreakdown] = React.useState({
    total: 0,
    inProgress: 0,
    ready: 0,
    cancelled: 0,
  });

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const today = new Date().toISOString().split("T")[0];

        const results = await Promise.allSettled([
          getAllUsers(),
          getAllOrders(),
          getAllReservations(),
          getAllContacts(),
          getAllFeedback(),
        ]);

        const getResultValue = (index: number) => {
          const result = results[index];
          return result.status === "fulfilled" ? result.value : null;
        };

        const usersResponse = getResultValue(0);
        const ordersResponse = getResultValue(1);
        const reservationsResponse = getResultValue(2);
        const contactsResponse = getResultValue(3);
        const feedbackResponse = getResultValue(4);

        const getArray = (response: any, key: string): any[] => {
          if (Array.isArray(response)) return response;
          if (Array.isArray(response?.data)) return response.data;
          if (Array.isArray(response?.[key])) return response[key];
          if (Array.isArray(response?.data?.[key])) return response.data[key];
          return [];
        };

        const usersArray = getArray(usersResponse, "users");
        const map = new Map<string, string>();
        usersArray.forEach((u: any) => {
          const id = u.id ?? u._id ?? u.$oid;
          if (id && u.name) map.set(id, u.name);
        });
        setUserMap(map);

        const allOrders: Order[] = getArray(ordersResponse, "orders");
        const sortedOrders = [...allOrders].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedOrders.slice(0, 5));

        const pendingTodayCount = allOrders.filter(
          (o) =>
            o.status === "pending" &&
            new Date(o.createdAt).toISOString().split("T")[0] === today
        ).length;
        setTodayPendingOrders(pendingTodayCount);

         const servedTodayCount = allOrders.filter(
           (o) =>
             o.status === "served" &&
             new Date(o.createdAt).toISOString().split("T")[0] === today
         ).length;
         setTodayServedOrders(servedTodayCount);

        const todayRevenueAmount = allOrders
          .filter(
            (o) =>
              o.status === "served" &&
              new Date(o.createdAt).toISOString().split("T")[0] === today
          )
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setTodayRevenue(todayRevenueAmount);

        const todaysOrders = allOrders.filter(
          (o) => new Date(o.createdAt).toISOString().split("T")[0] === today
        );
        const inProgressStatuses = ["accepted", "preparing"];
        setTodayOrderBreakdown({
          total: todaysOrders.length,
          inProgress: todaysOrders.filter((o) => inProgressStatuses.includes(o.status)).length,
          ready: todaysOrders.filter((o) => o.status === "ready").length,
          cancelled: todaysOrders.filter((o) => o.status === "cancelled").length,
        });

        const allReservations: Reservation[] = getArray(reservationsResponse, "reservations");
        setTodayReservations(allReservations.filter((r) => r.date === today));
        const upcoming = allReservations.filter((r) => r.date >= today);
        upcoming.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        setUpcomingReservations(upcoming);

        setContacts(getArray(contactsResponse, "contacts").slice(0, 5));
        setFeedback(getArray(feedbackResponse, "feedback").slice(0, 5));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader fullPage message="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="flex flex-1 relative z-10 flex-col lg:flex-row">
        {/* Sidebar - becomes horizontal top bar on mobile/tablet */}
        <aside className="w-full lg:w-72 lg:m-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-4 lg:p-6 flex flex-col lg:h-fit lg:sticky lg:top-6">
          {/* Header – border only on desktop */}
          <div className="flex flex-wrap items-center justify-between lg:block lg:pb-4 lg:border-b lg:border-gray-200">
            <div className="flex items-center gap-3 mb-0 lg:mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                Administrator
              </span>
            </div>
            <div className="hidden lg:block">
              <h3 className="font-semibold text-lg text-gray-900">{user?.name || "User"}</h3>
              <p className="text-sm text-gray-600 hidden lg:block">{user?.email || ""}</p>
            </div>
          </div>

          <h2 className="my-2 text-2xl font-bold text-gray-900 tracking-tight hidden lg:block">
            Admin Panel
          </h2>

          {/* Navigation – reorganized and stacked on mobile */}
          <nav className="flex flex-col gap-2 mb-4">
            {/* Manage Users */}
            <Link
              to="/users"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium text-sm lg:text-base w-full lg:w-auto bg-white/60 backdrop-blur-sm shadow-sm border border-gray-100/50 lg:bg-transparent lg:shadow-none lg:border-none"
            >
              <span className="lg:hidden w-8 h-8 rounded-full bg-[#ff9900]/10 flex items-center justify-center text-[#ff9900]">
                <Users size={16} />
              </span>
              Manage Users
            </Link>

            {/* Manage Orders */}
            <Link
              to="/manage-orders"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium text-sm lg:text-base w-full lg:w-auto bg-white/60 backdrop-blur-sm shadow-sm border border-gray-100/50 lg:bg-transparent lg:shadow-none lg:border-none"
            >
              <span className="lg:hidden w-8 h-8 rounded-full bg-[#ff9900]/10 flex items-center justify-center text-[#ff9900]">
                <ShoppingBag size={16} />
              </span>
              Manage Orders
            </Link>

            {/* Manage Items */}
            <Link
              to="/manage-items"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium text-sm lg:text-base w-full lg:w-auto bg-white/60 backdrop-blur-sm shadow-sm border border-gray-100/50 lg:bg-transparent lg:shadow-none lg:border-none"
            >
              <span className="lg:hidden w-8 h-8 rounded-full bg-[#ff9900]/10 flex items-center justify-center text-[#ff9900]">
                <Utensils size={16} />
              </span>
              Manage Items
            </Link>

            {/* View Reservations */}
            <Link
              to="/manage-reservations"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium text-sm lg:text-base w-full lg:w-auto bg-white/60 backdrop-blur-sm shadow-sm border border-gray-100/50 lg:bg-transparent lg:shadow-none lg:border-none"
            >
              <span className="lg:hidden w-8 h-8 rounded-full bg-[#ff9900]/10 flex items-center justify-center text-[#ff9900]">
                <Calendar size={16} />
              </span>
              View Reservations
            </Link>

            {/* Revenue Dashboard */}
            <Link
              to="/revenue-dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium text-sm lg:text-base w-full lg:w-auto bg-white/60 backdrop-blur-sm shadow-sm border border-gray-100/50 lg:bg-transparent lg:shadow-none lg:border-none"
            >
              <span className="lg:hidden w-8 h-8 rounded-full bg-[#ff9900]/10 flex items-center justify-center text-[#ff9900]">
                <BarChart3 size={16} />
              </span>
              Revenue Dashboard
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200 hidden lg:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#ff9900] font-bold text-lg">5</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Active Sections</p>
                <p className="text-sm text-gray-600">Ready to manage</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6 lg:mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                Control Center
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Welcome back, <span className="text-[#ff9900]">{user?.name.split(" ")[0] || "User"}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mt-2 max-w-2xl">
              Manage users, orders, reservations & more from your premium dashboard.
            </p>
          </div>

          {/* Key Metrics - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-10">

            {/* Today's Pending Orders */}
            <Link to="/manage-orders?date=today&status=pending" className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:border-yellow-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" opacity="0.3" />
                    <circle cx="12" cy="12" r="5" />
                    <polyline points="12 9 12 12 14.5 14" />
                    <path d="M5 2l-3 4h6L5 2z" fill="currentColor" />
                    <path d="M19 22l3-4h-6l3 4z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayPendingOrders}</p>
                </div>
              </div>
            </Link>

            {/* Today's Served Orders */}
            <Link to="/manage-orders?date=today&status=served" className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:border-green-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" opacity="0.15" fill="currentColor" />
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" opacity="0.5" />
                    <polyline points="8 12 11 15 16 9" strokeWidth="2" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Served Orders</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayServedOrders}</p>
                </div>
              </div>
            </Link>

            {/* Today's Reservations */}
            <Link to="/manage-reservations?date=today" className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:border-purple-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    <circle cx="12" cy="17" r="1.5" fill="currentColor" stroke="none" />
                    <path d="M12 13v2.5" strokeWidth="2" />
                    <path d="M9 17h6" strokeWidth="2" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Reservations</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{todayReservations.length}</p>
                </div>
              </div>
            </Link>

            {/* Today's Revenue */}
            <Link to="/revenue-dashboard" className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg hover:border-orange-400 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20h18" opacity="0.3" />
                    <path d="M3 17l6-5 4 3 7-7" />
                    <circle cx="20" cy="6" r="1.5" fill="currentColor" stroke="none" />
                    <path d="M18 4l2 4-4-0" fill="currentColor" stroke="none" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{todayRevenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Orders Status Breakdown - responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Total Orders Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{todayOrderBreakdown.total}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">In Progress</p>
              <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-2">{todayOrderBreakdown.inProgress}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Ready</p>
              <p className="text-2xl sm:text-3xl font-bold text-green-600 mt-2">{todayOrderBreakdown.ready}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-gray-200">
              <p className="text-[10px] sm:text-xs text-gray-600 uppercase tracking-wide">Cancelled</p>
              <p className="text-2xl sm:text-3xl font-bold text-red-600 mt-2">{todayOrderBreakdown.cancelled}</p>
            </div>
          </div>

          {/* Recent Data Tables - stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-10">
            {/* Recent Orders */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Orders</h3>
                <Link to="/manage-orders" className="text-[#ff9900] text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id ?? order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-600">
                          {userMap.get(order.user ?? "") || "Guest"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{order.totalAmount}</p>
                        <p
                          className={`text-xs font-medium ${
                            order.status === "served"
                              ? "text-green-600"
                              : order.status === "pending"
                              ? "text-yellow-600"
                              : order.status === "cancelled"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No orders yet</p>
                )}
              </div>
            </div>

            {/* Upcoming Reservations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Reservations</h3>
                <Link to="/manage-reservations" className="text-[#ff9900] text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingReservations.length > 0 ? (
                  upcomingReservations.slice(0, 5).map((res) => (
                    <div key={res.id ?? res._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{res.name}</p>
                        <p className="text-xs text-gray-600">
                          {res.date} at {res.time}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">{res.person} persons</p>
                        <p className="text-xs text-[#ff9900] font-medium">{res.status || "Pending"}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No upcoming reservations</p>
                )}
              </div>
            </div>
          </div>

          {/* Feedback & Contacts - stack on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 lg:mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Recent Feedback</h3>
              <div className="space-y-3">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <div key={item.id ?? item._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{item.name}</p>
                        <span className="text-xs bg-[#ff9900]/10 text-[#ff9900] px-2 py-1 rounded">
                          Feedback
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No feedback yet</p>
                )}
              </div>
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6">Recent Messages</h3>
              <div className="space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id ?? contact._id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900 text-sm sm:text-base">{contact.name}</p>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Message
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{contact.email}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{contact.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No messages</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions - stack on mobile */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/manage-orders?date=today"
              className="group px-6 sm:px-8 py-4 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-orange-500/20 hover:shadow-2xl inline-flex items-center justify-center gap-2"
            >
              View Today's Orders
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <Link
              to="/orders"
              className="px-6 sm:px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 font-semibold rounded-xl hover:bg-white hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg text-center"
            >
              View All Orders
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;