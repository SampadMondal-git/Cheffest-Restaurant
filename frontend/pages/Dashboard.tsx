import React from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "../api/manageUser";
import { getAllOrders, getOrderStats } from "../api/manageOrder";
import { getAllReservations, getReservationStats } from "../api/manageReservation";
import { getAllContacts, getAllFeedback } from "../api/adminDashboard";
import Loader from "../components/global/loader";

const Dashboard: React.FC = () => {
  type User = {
    id: string;
    name: string;
  };

  type Order = {
    id: string;
    status: string;
    orderNumber: string;
    totalAmount: number;
    createdAt: string;
    user?: { name: string };
  };

  type Reservation = {
    id: string;
    name: string;
    date: string;
    time: string;
    person: number;
    status?: string;
  };

  type Contact = {
    id: string;
    name: string;
    email: string;
    subject?: string;
    message: string;
    createdAt?: string;
  };

  type Feedback = {
    id: string;
    name: string;
    subject: string;
    message: string;
  };

  const [users, setUsers] = React.useState<User[]>([]);
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [orderStats, setOrderStats] = React.useState<any>({});
  const [reservations, setReservations] = React.useState<Reservation[]>([]);
  const [reservationStats, setReservationStats] = React.useState<any>({});
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [feedback, setFeedback] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          usersResponse,
          ordersResponse,
          orderStatsResponse,
          reservationsResponse,
          reservationStatsResponse,
          contactsResponse,
          feedbackResponse,
        ] = await Promise.all([
          getAllUsers(),
          getAllOrders(),
          getOrderStats(),
          getAllReservations(),
          getReservationStats(),
          getAllContacts(),
          getAllFeedback(),
        ]);

        setUsers(usersResponse.users || []);
        setOrders(ordersResponse.data?.slice(0, 5) || []);
        setOrderStats(orderStatsResponse.data || {});
        setReservations(reservationsResponse.data?.slice(0, 5) || []);
        setReservationStats(reservationStatsResponse.data || {});
        setContacts(contactsResponse.data?.slice(0, 5) || []);
        setFeedback(feedbackResponse.data?.slice(0, 5) || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      <div className="flex flex-1 relative z-10">
        {/* Sidebar */}
        <aside className="w-72 m-6 bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-6 flex flex-col h-fit sticky top-6">
          <div className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                Administrator
              </span>
            </div>
            <h3 className="font-semibold text-lg text-gray-900">Admin</h3>
            <p className="text-sm text-gray-600">admin@example.com</p>
          </div>

          <h2 className="my-2 text-2xl font-bold text-gray-900 tracking-tight">
            Admin Panel
          </h2>

          <nav className="space-y-2 mb-4">
            <Link
              to="/users"
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium"
            >
              Manage Users
            </Link>
            <Link
              to="/items"
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium"
            >
              Manage Items
            </Link>
            <Link
              to="/manage-orders"
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium"
            >
              Manage Orders
            </Link>
            <Link
              to="/manage-orders"
              className="block px-4 py-3 rounded-xl text-gray-700 hover:bg-[#ff9900]/10 hover:text-[#ff9900] transition-all duration-200 font-medium"
            >
              View Reservations
            </Link>
          </nav>

          <div className="mt-auto pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#ff9900]/10 rounded-lg flex items-center justify-center">
                <span className="text-[#ff9900] font-bold text-lg">4</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Active Sections</p>
                <p className="text-sm text-gray-600">Ready to manage</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                Control Center
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Welcome back, <span className="text-[#ff9900]">Admin</span>
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl">
              Manage users, orders, reservations & more from your premium dashboard.
            </p>
          </div>

          {/* Key Metrics - 5 Column Layout */}
          {/* Key Metrics - 5 Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
            {/* Total Users */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    <circle cx="20" cy="5" r="3" fill="currentColor" fillOpacity="0.15" stroke="none" />
                    <path d="M19.5 5l-1.5 1.5" strokeWidth="2" />
                    <circle cx="20" cy="5" r="1" fill="white" stroke="none" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                </div>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" opacity="0.3" />
                    <circle cx="12" cy="12" r="5" />
                    <polyline points="12 9 12 12 14.5 14" />
                    <path d="M5 2l-3 4h6L5 2z" fill="currentColor" />
                    <path d="M19 22l3-4h-6l3 4z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.pendingOrders || 0}</p>
                </div>
              </div>
            </div>

            {/* Served Orders */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" opacity="0.15" fill="currentColor" />
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" opacity="0.5" />
                    <polyline points="8 12 11 15 16 9" strokeWidth="2" />
                    <path d="M12 2v2m0 16v2M2 12h2m16 0h2" opacity="0.3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Served Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{orderStats.servedOrders || 0}</p>
                </div>
              </div>
            </div>

            {/* Reservations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
                  <p className="text-sm text-gray-600">Reservations</p>
                  <p className="text-2xl font-bold text-gray-900">{reservationStats.totalReservations || 0}</p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20h18" opacity="0.3" />
                    <path d="M3 17l6-5 4 3 7-7" />
                    <circle cx="20" cy="6" r="1.5" fill="currentColor" stroke="none" />
                    <path d="M18 4l2 4-4-0" fill="currentColor" stroke="none" opacity="0.5" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{(orderStats.totalRevenue || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Orders Status Breakdown */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{orderStats.totalOrders || 0}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">In Progress</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {(orderStats.acceptedOrders || 0) + (orderStats.preparingOrders || 0)}
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Ready</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{orderStats.readyOrders || 0}</p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide">Cancelled</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{orderStats.cancelledOrders || 0}</p>
            </div>
          </div>

          {/* Recent Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Recent Orders */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Orders</h3>
                <Link to="/manage-orders" className="text-[#ff9900] text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-xs text-gray-600">{order.user?.name || "Guest"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{order.totalAmount}</p>
                        <p className={`text-xs font-medium ${order.status === 'served' ? 'text-green-600' :
                          order.status === 'pending' ? 'text-yellow-600' :
                            order.status === 'cancelled' ? 'text-red-600' :
                              'text-blue-600'
                          }`}>
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

            {/* Recent Reservations */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Upcoming Reservations</h3>
                <Link to="/manage-orders" className="text-[#ff9900] text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {reservations.length > 0 ? (
                  reservations.map((res) => (
                    <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{res.name}</p>
                        <p className="text-xs text-gray-600">{res.date} at {res.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{res.person} persons</p>
                        <p className="text-xs text-[#ff9900] font-medium">{res.status || 'Pending'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No reservations</p>
                )}
              </div>
            </div>
          </div>

          {/* Feedback & Contacts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Recent Feedback */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Feedback</h3>
              <div className="space-y-3">
                {feedback.length > 0 ? (
                  feedback.map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <span className="text-xs bg-[#ff9900]/10 text-[#ff9900] px-2 py-1 rounded">Feedback</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{item.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 text-center py-4">No feedback yet</p>
                )}
              </div>
            </div>

            {/* Recent Contacts */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Messages</h3>
              <div className="space-y-3">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-medium text-gray-900">{contact.name}</p>
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Message</span>
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

          {/* Quick Actions */}
          <div className="flex gap-4">
            <Link
              to="/items/add"
              className="group px-8 py-4 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-orange-500/20 hover:shadow-2xl inline-flex items-center gap-2"
            >
              Add New Menu Item
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
              className="px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 font-semibold rounded-xl hover:bg-white hover:border-[#ff9900] transition-all duration-300 hover:shadow-lg"
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