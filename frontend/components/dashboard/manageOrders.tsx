import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllOrders, manageOrderStatus } from "../../api/manageOrder";
import Loader from "../global/loader";

// Type definitions
interface OrderItem {
    item: string;
    nameAtOrder: string;
    priceAtOrder: number;
    quantity: number;
    _id: string;
}

interface Payment {
    method?: string;
    status?: string;
    transactionId?: string;
    amount?: number;
}

interface Order {
    _id: string;
    orderNumber: string;
    status: string;
    tableNumber: number;
    totalAmount: number;
    items: OrderItem[];
    payment: Payment[];
    user: string;
    createdAt: string;
    updatedAt: string;
    cgst?: number;
    sgst?: number;
    gst?: number;
}

function ManageOrders() {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showStatusModal, setShowStatusModal] = useState<boolean>(false);
    const [statusUpdateLoading, setStatusUpdateLoading] =
        useState<boolean>(false);
    const [statusUpdateError, setStatusUpdateError] = useState<string | null>(
        null
    );
    const [tempNewStatus, setTempNewStatus] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (searchParams.get("date") === "today") {
            setSelectedDate(new Date());
        }
        const status = searchParams.get("status");
        if (status) {
            setSelectedStatus(status);
        }
    }, [searchParams]);

    const getOrderTotal = (order: Order): number => {
        return order.items.reduce(
            (sum, item) => sum + item.priceAtOrder * item.quantity,
            0
        );
    };

    const GST_RATE = 0.18;
    const CGST_RATE = GST_RATE / 2;
    const SGST_RATE = GST_RATE / 2;

    const getTaxBreakdown = (order: Order) => {
        if (order.cgst !== undefined && order.sgst !== undefined) {
            return { cgst: order.cgst || 0, sgst: order.sgst || 0 };
        }
        if (order.gst !== undefined) {
            const totalGst = order.gst || 0;
            return { cgst: totalGst / 2, sgst: totalGst / 2 };
        }
        const total = getOrderTotal(order);
        if (total === 0) return { cgst: 0, sgst: 0 };
        const base = total / (1 + GST_RATE);
        const totalGst = total - base;
        return { cgst: totalGst / 2, sgst: totalGst / 2 };
    };

    const fetchOrders = useCallback(async () => {
        try {
            const response = await getAllOrders();
            const data = response.data || response.orders || response;
            let ordersArray: Order[] = [];
            if (Array.isArray(data)) {
                ordersArray = data;
            } else if (data?.orders && Array.isArray(data.orders)) {
                ordersArray = data.orders;
            }
            ordersArray.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
            setOrders(ordersArray);
            setError(null);
        } catch (err) {
            setError("Failed to load orders. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const load = async () => {
            await fetchOrders();
        };
        void load();
    }, [fetchOrders]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (
                showCalendar &&
                calendarRef.current &&
                !calendarRef.current.contains(e.target as Node)
            ) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showCalendar]);

    const isSameDay = (date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    const dateFilteredOrders = useMemo(() => {
        if (selectedDate) {
            return orders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return isSameDay(orderDate, selectedDate);
            });
        }
        return orders;
    }, [orders, selectedDate]);

    const statusCounts = {
        pending: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "pending"
        ).length,
        accepted: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "accepted"
        ).length,
        preparing: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "preparing"
        ).length,
        ready: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "ready"
        ).length,
        served: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "served"
        ).length,
        cancelled: dateFilteredOrders.filter(
            (o) => o.status.toLowerCase() === "cancelled"
        ).length,
    };

    const filteredOrders = useMemo(() => {
        let filtered = dateFilteredOrders;
        if (selectedStatus) {
            filtered = filtered.filter(
                (o) => o.status.toLowerCase() === selectedStatus.toLowerCase()
            );
        }
        return filtered;
    }, [dateFilteredOrders, selectedStatus]);

    const ordersByDate = useMemo(() => {
        const map = new Map<string, number>();
        orders.forEach((order) => {
            const key = new Date(order.createdAt).toDateString();
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }, [orders]);

    const handleStatusUpdate = async (newStatus: string) => {
        if (!selectedOrder) return;
        setStatusUpdateLoading(true);
        setStatusUpdateError(null);
        try {
            await manageOrderStatus(selectedOrder._id, newStatus);
            setOrders(
                orders.map((order) =>
                    order._id === selectedOrder._id
                        ? { ...order, status: newStatus }
                        : order
                )
            );
            setSelectedOrder({ ...selectedOrder, status: newStatus });
            setShowStatusModal(false);
        } catch (err) {
            setStatusUpdateError(
                "Failed to update order status. Please try again."
            );
            console.error(err);
        } finally {
            setStatusUpdateLoading(false);
        }
    };

    const statusPillStyle = (status: string, isActive: boolean) => {
        const base =
            "px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 border";
        const activeRing = isActive
            ? "ring-2 ring-[#ff9900] ring-offset-1 shadow-lg"
            : "";
        switch (status.toLowerCase()) {
            case "pending":
                return `${base} bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200 ${activeRing}`;
            case "accepted":
                return `${base} bg-green-100 text-green-800 border-green-200 hover:bg-green-200 ${activeRing}`;
            case "preparing":
                return `${base} bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 ${activeRing}`;
            case "ready":
                return `${base} bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-200 ${activeRing}`;
            case "served":
                return `${base} bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 ${activeRing}`;
            case "cancelled":
                return `${base} bg-red-100 text-red-800 border-red-200 hover:bg-red-200 ${activeRing}`;
            default:
                return `${base} bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 ${activeRing}`;
        }
    };

    const statusBadgeSmall = (status: string) => {
        const base =
            "px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide inline-block";
        switch (status.toLowerCase()) {
            case "pending":
                return `${base} bg-yellow-100 text-yellow-800 border border-yellow-200`;
            case "accepted":
                return `${base} bg-green-100 text-green-800 border border-green-200`;
            case "preparing":
                return `${base} bg-blue-100 text-blue-800 border border-blue-200`;
            case "ready":
                return `${base} bg-cyan-100 text-cyan-800 border border-cyan-200`;
            case "served":
                return `${base} bg-emerald-100 text-emerald-800 border border-emerald-200`;
            case "cancelled":
                return `${base} bg-red-100 text-red-800 border border-red-200`;
            default:
                return `${base} bg-gray-100 text-gray-600 border border-gray-200`;
        }
    };

    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();
    const getStartDay = (year: number, month: number) =>
        new Date(year, month, 1).getDay();

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);
    const today = new Date();

    const totalCells = 42;
    const cells: Array<{
        day: number | null;
        date: Date | null;
        isCurrentMonth: boolean;
    }> = [];

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = startDay - 1; i >= 0; i--) {
        cells.push({
            day: prevMonthDays - i,
            date: new Date(year, month - 1, prevMonthDays - i),
            isCurrentMonth: false,
        });
    }
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({
            day,
            date: new Date(year, month, day),
            isCurrentMonth: true,
        });
    }
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
        cells.push({
            day,
            date: new Date(year, month + 1, day),
            isCurrentMonth: false,
        });
    }

    const changeMonth = (delta: number) => {
        const newMonth = new Date(calendarMonth);
        newMonth.setMonth(newMonth.getMonth() + delta);
        setCalendarMonth(newMonth);
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowCalendar(false);
        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const goToToday = () => {
        const todayDate = new Date();
        setCalendarMonth(
            new Date(todayDate.getFullYear(), todayDate.getMonth(), 1)
        );
    };

    const formatSelectedDate = (date: Date) =>
        date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });

    return (
        <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 px-6 md:px-12 lg:px-20 py-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                            Order Management
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Manage <span className="text-[#ff9900]">Orders</span>
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                        View and manage all customer orders in one place.
                    </p>
                </div>

                {/* Filters Section */}
                {!loading && !error && (
                    <div className="mb-10">
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Order Status Overview
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            {[
                                "pending",
                                "accepted",
                                "preparing",
                                "ready",
                                "served",
                                "cancelled",
                            ].map((status) => (
                                <button
                                    key={status}
                                    onClick={() =>
                                        setSelectedStatus(
                                            selectedStatus === status
                                                ? null
                                                : status
                                        )
                                    }
                                    className={statusPillStyle(
                                        status,
                                        selectedStatus === status
                                    )}
                                >
                                    {status.charAt(0).toUpperCase() +
                                        status.slice(1)}{" "}
                                    <span className="ml-1 font-bold">
                                        (
                                        {
                                            statusCounts[
                                                status as keyof typeof statusCounts
                                            ]
                                        }
                                        )
                                    </span>
                                </button>
                            ))}

                            <div className="hidden lg:flex items-center text-gray-300 text-2xl select-none mx-1">
                                |
                            </div>

                            {/* Calendar picker */}
                            <div className="relative" ref={calendarRef}>
                                <button
                                    onClick={() =>
                                        setShowCalendar(!showCalendar)
                                    }
                                    className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 border flex items-center gap-2 cursor-pointer
                                        ${selectedDate
                                            ? "bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900] ring-2 ring-[#ff9900]/30"
                                            : "border-dashed border-gray-300 text-gray-600 hover:border-[#ff9900] hover:text-[#ff9900]"
                                        }`}
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M8 7V3m8 4V3m-9 8h10m7 8H3V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                    {selectedDate
                                        ? formatSelectedDate(selectedDate)
                                        : "Filter by date"}
                                    {selectedDate && (
                                        <span
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearDateFilter();
                                            }}
                                            className="ml-1 w-4 h-4 rounded-full bg-gray-200 hover:bg-red-200 flex items-center justify-center transition cursor-pointer"
                                        >
                                            <svg
                                                className="w-3 h-3 text-gray-600"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M6 18L18 6M6 6l12 12"
                                                />
                                            </svg>
                                        </span>
                                    )}
                                </button>

                                {showCalendar && (
                                    <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-30">
                                        <div className="flex items-center justify-between mb-3">
                                            <button
                                                onClick={() => changeMonth(-1)}
                                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <svg
                                                    className="w-5 h-5 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 19l-7-7 7-7"
                                                    />
                                                </svg>
                                            </button>
                                            <span className="text-sm font-bold text-gray-800">
                                                {calendarMonth.toLocaleDateString(
                                                    "en-US",
                                                    {
                                                        month: "long",
                                                        year: "numeric",
                                                    }
                                                )}
                                            </span>
                                            <button
                                                onClick={() => changeMonth(1)}
                                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                            >
                                                <svg
                                                    className="w-5 h-5 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M9 5l7 7-7 7"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-7 mb-2">
                                            {daysOfWeek.map((day) => (
                                                <div
                                                    key={day}
                                                    className="text-center text-xs font-semibold text-gray-400 py-1"
                                                >
                                                    {day}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="grid grid-cols-7 gap-1">
                                            {cells.map((cell, idx) => {
                                                if (!cell.date)
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className="aspect-square"
                                                        ></div>
                                                    );
                                                const dateStr =
                                                    cell.date.toDateString();
                                                const isToday = isSameDay(
                                                    cell.date,
                                                    today
                                                );
                                                const isSelected =
                                                    selectedDate &&
                                                    isSameDay(
                                                        cell.date,
                                                        selectedDate
                                                    );
                                                const hasOrders =
                                                    ordersByDate.has(dateStr) &&
                                                    (ordersByDate.get(
                                                        dateStr
                                                    ) ||
                                                        0) > 0;
                                                return (
                                                    <button
                                                        key={idx}
                                                        disabled={
                                                            !cell.isCurrentMonth
                                                        }
                                                        onClick={() =>
                                                            cell.isCurrentMonth &&
                                                            cell.date &&
                                                            handleDateSelect(
                                                                cell.date
                                                            )
                                                        }
                                                        className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 relative cursor-pointer
                                                            ${!cell.isCurrentMonth
                                                                ? "text-gray-300 cursor-default"
                                                                : "hover:bg-[#ff9900]/10"
                                                            }
                                                            ${isSelected
                                                                ? "bg-[#ff9900] text-white font-bold shadow-md"
                                                                : ""
                                                            }
                                                            ${isToday && !isSelected
                                                                ? "ring-2 ring-[#ff9900]/50"
                                                                : ""
                                                            }
                                                        `}
                                                    >
                                                        {cell.day}
                                                        {hasOrders &&
                                                            cell.isCurrentMonth && (
                                                                <span
                                                                    className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected
                                                                        ? "bg-white"
                                                                        : "bg-[#ff9900]"
                                                                        }`}
                                                                ></span>
                                                            )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                                            <button
                                                onClick={() => {
                                                    goToToday();
                                                    handleDateSelect(today);
                                                }}
                                                className="text-xs font-semibold text-[#ff9900] hover:underline cursor-pointer"
                                            >
                                                Today
                                            </button>
                                            <button
                                                onClick={() =>
                                                    setShowCalendar(false)
                                                }
                                                className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                            >
                                                Close
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedDate && (
                                <div className="flex items-center gap-2 ml-2">
                                    <div className="flex items-center gap-1 px-3 py-1 bg-[#ff9900]/10 rounded-full text-sm text-[#ff9900] font-medium">
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M8 7V3m8 4V3m-9 8h10m7 8H3V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        {formatSelectedDate(selectedDate)}
                                    </div>
                                    <button
                                        onClick={clearDateFilter}
                                        className="text-sm text-gray-500 hover:text-red-500 underline cursor-pointer"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                        </div>

                        {selectedStatus && (
                            <button
                                onClick={() => setSelectedStatus(null)}
                                className="mt-3 text-sm text-[#ff9900] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                                Clear filter
                            </button>
                        )}
                    </div>
                )}

                {loading && <Loader message="Loading orders..." />}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <svg
                            className="w-10 h-10 text-red-400 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.8"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="text-red-700 font-semibold">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && (
                    <div className="space-y-6">
                        {filteredOrders.length === 0 ? (
                            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-gray-200">
                                <svg
                                    className="w-16 h-16 text-gray-400 mx-auto mb-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1.5"
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <p className="text-gray-600 text-lg font-medium">
                                    {selectedDate
                                        ? `No orders found on ${formatSelectedDate(
                                            selectedDate
                                        )}`
                                        : selectedStatus
                                            ? `No orders with status "${selectedStatus}" found.`
                                            : "No orders found."}
                                </p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => {
                                const total = getOrderTotal(order);
                                const tax = getTaxBreakdown(order);
                                return (
                                    <div
                                        key={order._id}
                                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    >
                                        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-100">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="w-5 h-5 text-[#ff9900]"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.8"
                                                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                        />
                                                    </svg>
                                                    <span className="font-bold text-gray-900 text-lg">
                                                        {order.orderNumber}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="w-5 h-5 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.8"
                                                            d="M3 12l2-2m0 0l7-7 7 7m-9-7v12"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Table {order.tableNumber}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <svg
                                                        className="w-5 h-5 text-gray-500"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.8"
                                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                    <span className="text-sm font-medium text-gray-600">
                                                        ₹{total}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span
                                                    className={statusBadgeSmall(
                                                        order.status
                                                    )}
                                                >
                                                    {order.status}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatDate(
                                                        order.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 bg-gray-50/50">
                                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                                                Items
                                            </p>
                                            <ul className="space-y-2">
                                                {order.items.map((item) => (
                                                    <li
                                                        key={item._id}
                                                        className="flex justify-between items-center"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 bg-[#ff9900] rounded-full"></div>
                                                            <span className="text-gray-800 font-medium">
                                                                {
                                                                    item.nameAtOrder
                                                                }
                                                            </span>
                                                            <span className="text-gray-500 text-sm">
                                                                x{item.quantity}
                                                            </span>
                                                        </div>
                                                        <span className="text-gray-700 font-semibold">
                                                            ₹
                                                            {item.priceAtOrder *
                                                                item.quantity}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                                                <span>
                                                    CGST (
                                                    {(CGST_RATE * 100).toFixed(
                                                        0
                                                    )}
                                                    %)
                                                </span>
                                                <span>
                                                    ₹{tax.cgst.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="mt-1 flex justify-between text-sm text-gray-600">
                                                <span>
                                                    SGST (
                                                    {(SGST_RATE * 100).toFixed(
                                                        0
                                                    )}
                                                    %)
                                                </span>
                                                <span>
                                                    ₹{tax.sgst.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="mt-2 pt-2 border-t-2 border-gray-200 flex justify-between items-center">
                                                <span className="text-sm font-bold text-gray-700">
                                                    Total
                                                </span>
                                                <span className="text-base font-extrabold text-gray-900">
                                                    ₹{total}
                                                </span>
                                            </div>

                                            {order.payment && order.payment[0] && (
                                                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center gap-2 text-sm text-gray-600">
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth="1.8"
                                                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                                        />
                                                    </svg>
                                                    <span>
                                                        Payment:{" "}
                                                        {order.payment[0]
                                                            .method ===
                                                            "not_selected"
                                                            ? "N/A"
                                                            : order.payment[0]
                                                                .method
                                                                ? order
                                                                    .payment[0]
                                                                    .method
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                order
                                                                    .payment[0]
                                                                    .method
                                                                    .slice(1)
                                                                : "N/A"}
                                                    </span>
                                                    {order.payment[0]
                                                        .status && (
                                                            <span className="px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                                                                {order
                                                                    .payment[0]
                                                                    .status
                                                                    .charAt(0)
                                                                    .toUpperCase() +
                                                                    order
                                                                        .payment[0]
                                                                        .status
                                                                        .slice(
                                                                            1
                                                                        )}
                                                            </span>
                                                        )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-4 flex justify-end gap-3 border-t border-gray-100">
                                            <button
                                                onClick={() =>
                                                    setSelectedOrder(order)
                                                }
                                                className="px-5 py-2 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:bg-white hover:border-[#ff9900] transition-all duration-300 text-sm cursor-pointer"
                                            >
                                                View Details
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowStatusModal(true);
                                                    setTempNewStatus(null);
                                                }}
                                                className="px-5 py-2 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition-all duration-300 hover:shadow-orange-500/20 hover:shadow-lg text-sm cursor-pointer"
                                            >
                                                Update Status
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* ============================================================ */}
                {/* FINAL FIXED VIEW DETAILS MODAL – fully contained              */}
                {/* ============================================================ */}
                {selectedOrder && !showStatusModal && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-2xl max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
                            {/* Header – fixed */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                                <div>
                                    <span className="text-sm font-semibold text-[#ff9900] uppercase">
                                        Order Details
                                    </span>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {selectedOrder.orderNumber}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Body – scrollable */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <div className="px-4 py-1.5 bg-gray-50 rounded-full text-sm font-semibold text-gray-700">
                                        Table {selectedOrder.tableNumber}
                                    </div>
                                    <span
                                        className={statusBadgeSmall(
                                            selectedOrder.status
                                        )}
                                    >
                                        {selectedOrder.status}
                                    </span>
                                    <div className="px-4 py-1.5 bg-gray-50 rounded-full text-sm font-semibold text-gray-700">
                                        ₹{getOrderTotal(selectedOrder)}
                                    </div>
                                    {selectedOrder.payment[0]?.method && (
                                        <div className="px-4 py-1.5 bg-gray-50 rounded-full text-sm font-semibold text-gray-700 capitalize">
                                            {selectedOrder.payment[0].method}
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                        Items Ordered
                                    </h3>
                                    <div className="space-y-1.5">
                                        {selectedOrder.items.map((item) => (
                                            <div
                                                key={item._id}
                                                className="flex justify-between py-1.5 border-b border-gray-100"
                                            >
                                                <div>
                                                    <span className="font-medium text-gray-800">
                                                        {item.nameAtOrder}
                                                    </span>
                                                    <span className="text-gray-500 text-sm ml-2">
                                                        ×{item.quantity}
                                                    </span>
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    ₹
                                                    {item.priceAtOrder *
                                                        item.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {(() => {
                                        const tax = getTaxBreakdown(
                                            selectedOrder
                                        );
                                        return (
                                            <>
                                                <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between text-sm text-gray-600">
                                                    <span>
                                                        CGST (
                                                        {(CGST_RATE * 100).toFixed(
                                                            0
                                                        )}
                                                        %)
                                                    </span>
                                                    <span>
                                                        ₹{tax.cgst.toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="mt-0.5 flex justify-between text-sm text-gray-600">
                                                    <span>
                                                        SGST (
                                                        {(SGST_RATE * 100).toFixed(
                                                            0
                                                        )}
                                                        %)
                                                    </span>
                                                    <span>
                                                        ₹{tax.sgst.toFixed(2)}
                                                    </span>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="flex justify-between pt-2 mt-2 border-t-2 border-gray-200">
                                        <span className="font-bold text-gray-900">
                                            Total
                                        </span>
                                        <span className="font-bold text-gray-900">
                                            ₹{getOrderTotal(selectedOrder)}
                                        </span>
                                    </div>
                                </div>

                                {selectedOrder.payment[0] && (
                                    <div className="mb-4">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                                            Payment Info
                                        </h3>
                                        <div className="grid grid-cols-2 gap-1 text-sm">
                                            <span className="text-gray-600">
                                                Method
                                            </span>
                                            <span className="text-gray-900 font-medium capitalize">
                                                {selectedOrder.payment[0]
                                                    .method || "N/A"}
                                            </span>
                                            <span className="text-gray-600">
                                                Status
                                            </span>
                                            <span className="text-gray-900 font-medium">
                                                {selectedOrder.payment[0]
                                                    .status || "N/A"}
                                            </span>
                                            {selectedOrder.payment[0]
                                                .transactionId && (
                                                <>
                                                    <span className="text-gray-600">
                                                        Transaction ID
                                                    </span>
                                                    <span className="text-gray-900 font-medium break-all text-xs">
                                                        {
                                                            selectedOrder
                                                                .payment[0]
                                                                .transactionId
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="text-sm text-gray-500 space-y-0.5">
                                    <p>
                                        Placed:{" "}
                                        {formatDate(selectedOrder.createdAt)}
                                    </p>
                                    <p>
                                        Last updated:{" "}
                                        {formatDate(selectedOrder.updatedAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Footer – fixed */}
                            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex gap-3 justify-end">
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-6 py-2.5 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:border-[#ff9900] transition cursor-pointer"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowStatusModal(true);
                                        setTempNewStatus(null);
                                    }}
                                    className="px-6 py-2.5 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl hover:shadow-orange-500/20 hover:shadow-lg transition cursor-pointer"
                                >
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================ */}
                {/* FINAL FIXED STATUS UPDATE MODAL – fully contained             */}
                {/* ============================================================ */}
                {showStatusModal && selectedOrder && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-md max-h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
                            {/* Header – fixed */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
                                <div>
                                    <span className="text-sm font-semibold text-[#ff9900] uppercase">
                                        Update Status
                                    </span>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {selectedOrder.orderNumber}
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    disabled={statusUpdateLoading}
                                    className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50 cursor-pointer"
                                >
                                    <svg
                                        className="w-6 h-6 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>

                            {/* Body – scrollable */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
                                <p className="text-sm text-gray-600 mb-4">
                                    Current Status:{" "}
                                    <span
                                        className={statusBadgeSmall(
                                            selectedOrder.status
                                        )}
                                    >
                                        {selectedOrder.status}
                                    </span>
                                </p>

                                {statusUpdateError && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-sm text-red-700">
                                            {statusUpdateError}
                                        </p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">
                                        Select New Status
                                    </label>
                                    <div className="space-y-1.5">
                                        {[
                                            "pending",
                                            "accepted",
                                            "preparing",
                                            "ready",
                                            "served",
                                            "cancelled",
                                        ].map((status) => (
                                            <button
                                                key={status}
                                                onClick={() =>
                                                    setTempNewStatus(status)
                                                }
                                                disabled={
                                                    statusUpdateLoading ||
                                                    selectedOrder.status.toLowerCase() ===
                                                    status.toLowerCase()
                                                }
                                                className={`w-full px-4 py-2.5 rounded-xl font-semibold text-left transition-all duration-200 border-2 flex items-center justify-between cursor-pointer ${
                                                    selectedOrder.status.toLowerCase() ===
                                                        status.toLowerCase()
                                                        ? "bg-gray-100 border-gray-300 cursor-not-allowed opacity-60 text-gray-600"
                                                        : tempNewStatus ===
                                                          status
                                                            ? "bg-orange-50 border-[#ff9900] text-gray-900"
                                                            : "border-gray-200 hover:border-[#ff9900] hover:bg-orange-50 text-gray-800"
                                                } ${
                                                    statusUpdateLoading
                                                        ? "opacity-50 cursor-not-allowed"
                                                        : ""
                                                }`}
                                            >
                                                <span className="capitalize">
                                                    {status}
                                                </span>
                                                {tempNewStatus === status && (
                                                    <svg
                                                        className="w-5 h-5 text-[#ff9900]"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {statusUpdateLoading && (
                                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <div className="w-4 h-4 border-2 border-[#ff9900]/30 border-t-[#ff9900] rounded-full animate-spin"></div>
                                        <span>Updating…</span>
                                    </div>
                                )}
                            </div>

                            {/* Footer – fixed */}
                            <div className="px-6 py-4 border-t border-gray-200 shrink-0 flex gap-3">
                                <button
                                    onClick={() => setShowStatusModal(false)}
                                    disabled={statusUpdateLoading}
                                    className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 font-semibold rounded-xl hover:border-gray-300 transition disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() =>
                                        tempNewStatus &&
                                        handleStatusUpdate(tempNewStatus)
                                    }
                                    disabled={
                                        statusUpdateLoading || !tempNewStatus
                                    }
                                    className="flex-1 px-4 py-2.5 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-orange-500/20 hover:shadow-lg cursor-pointer"
                                >
                                    {statusUpdateLoading
                                        ? "Updating…"
                                        : "Confirm"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .animate-in {
                    animation: fadeIn 0.2s ease-out;
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
            `}</style>
        </div>
    );
}

export default ManageOrders;