import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { getAllReservations, updateReservation, fetchReservation } from "../../api/manageReservation";
import Loader from "../global/loader";

// Type definitions for reservation data
interface Reservation {
    _id: string;
    user?: {
        name: string;
        email: string;
    };
    name: string;
    email: string;
    phone?: string;
    date: string;
    time: string;
    person: number;
    tableNumber?: number;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

function ManageReservation() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedDateCategory, setSelectedDateCategory] = useState<"past" | "today" | "future">("today");
    const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());
    const calendarRef = useRef<HTMLDivElement>(null);

    const fetchReservationsData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getAllReservations();
            const data = response.data || response.reservations || response;
            if (Array.isArray(data)) {
                setReservations(data);
            } else if (data?.reservations && Array.isArray(data.reservations)) {
                setReservations(data.reservations);
            } else {
                setReservations([]);
            }
            setError(null);
        } catch (err) {
            setError("Failed to load reservations. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const loadReservations = async () => {
            await fetchReservationsData();
        };

        void loadReservations();
    }, [fetchReservationsData]);

    // Close calendar on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showCalendar && calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [showCalendar]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const isSameDay = useCallback((date1: Date, date2: Date): boolean => {
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    }, []);

    const categorizeByDate = useCallback((reservation: Reservation): "past" | "today" | "future" => {
        const reservationDate = new Date(reservation.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        reservationDate.setHours(0, 0, 0, 0);

        if (reservationDate < today) return "past";
        if (isSameDay(reservationDate, today)) return "today";
        return "future";
    }, [isSameDay]);

    const getDateCategoryCounts = () => {
        return {
            past: reservations.filter((r) => categorizeByDate(r) === "past").length,
            today: reservations.filter((r) => categorizeByDate(r) === "today").length,
            future: reservations.filter((r) => categorizeByDate(r) === "future").length,
        };
    };

    // Reservations filtered by the active date filter (category or specific date)
    const dateFilteredReservations = useMemo(() => {
        if (selectedDate) {
            return reservations.filter((r) => isSameDay(new Date(r.date), selectedDate));
        }
        return reservations.filter((r) => categorizeByDate(r) === selectedDateCategory);
    }, [reservations, selectedDate, selectedDateCategory, categorizeByDate, isSameDay]);

    const statusCounts = {
        active: dateFilteredReservations.filter((r) => r.status?.toLowerCase() === "active").length,
        cancelled: dateFilteredReservations.filter((r) => r.status?.toLowerCase() === "cancelled").length,
    };

    const filteredReservations = useMemo(() => {
        let filtered = dateFilteredReservations;
        if (selectedStatus) {
            filtered = filtered.filter((r) => r.status?.toLowerCase() === selectedStatus.toLowerCase());
        }
        return filtered;
    }, [dateFilteredReservations, selectedStatus]);

    // For calendar dots: map of date string -> reservation count
    const reservationsByDate = useMemo(() => {
        const map = new Map<string, number>();
        reservations.forEach((r) => {
            const key = new Date(r.date).toDateString();
            map.set(key, (map.get(key) || 0) + 1);
        });
        return map;
    }, [reservations]);

    const handleStatusChange = async (reservationId: string, newStatus: string) => {
        try {
            setUpdatingId(reservationId);
            await updateReservation(reservationId, { status: newStatus });

            setReservations((prev) =>
                prev.map((r) => (r._id === reservationId ? { ...r, status: newStatus } : r))
            );

            if (selectedReservation?._id === reservationId) {
                setSelectedReservation({ ...selectedReservation, status: newStatus });
            }
            setUpdatingId(null);
        } catch (err) {
            console.error("Failed to update reservation status:", err);
            setUpdatingId(null);
        }
    };

    const openModal = async (reservation: Reservation) => {
        try {
            const detailedData = await fetchReservation(reservation._id);
            setSelectedReservation(detailedData.data || detailedData);
        } catch {
            setSelectedReservation(reservation);
        }
        setIsModalOpen(true);
    };

    const statusPillStyle = (status: string, isActive: boolean) => {
        const base = "px-4 py-2 text-xs font-semibold rounded-full cursor-pointer transition-all duration-200 border";
        const activeRing = isActive ? "ring-2 ring-[#ff9900] ring-offset-1 shadow-lg" : "";
        switch (status.toLowerCase()) {
            case "active":
                return `${base} bg-green-100 text-green-800 border-green-200 hover:bg-green-200 ${activeRing}`;
            case "cancelled":
                return `${base} bg-red-100 text-red-800 border-red-200 hover:bg-red-200 ${activeRing}`;
            default:
                return `${base} bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200 ${activeRing}`;
        }
    };

    const isPastReservation = (reservation: Reservation) => {
        return categorizeByDate(reservation) === "past";
    };

    // Calendar helpers
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getStartDay = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getStartDay(year, month);
    const today = new Date();

    const totalCells = 42; // 6 rows x 7 days
    const cells: Array<{ day: number | null; date: Date | null; isCurrentMonth: boolean }> = [];

    // Previous month filler days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = startDay - 1; i >= 0; i--) {
        cells.push({ day: prevMonthDays - i, date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false });
    }
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
        cells.push({ day, date: new Date(year, month, day), isCurrentMonth: true });
    }
    // Next month filler days
    const remaining = totalCells - cells.length;
    for (let day = 1; day <= remaining; day++) {
        cells.push({ day, date: new Date(year, month + 1, day), isCurrentMonth: false });
    }

    const changeMonth = (delta: number) => {
        const newMonth = new Date(calendarMonth);
        newMonth.setMonth(newMonth.getMonth() + delta);
        setCalendarMonth(newMonth);
    };

    const clearDateFilter = () => {
        setSelectedDate(null);
    };

    const handleCategoryPillClick = (key: "past" | "today" | "future") => {
        setSelectedDate(null);
        setSelectedDateCategory(key);
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowCalendar(false);
        // keep calendar month on selected date
        setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    };

    const goToToday = () => {
        const todayDate = new Date();
        setCalendarMonth(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1));
    };

    const formatSelectedDate = (date: Date) =>
        date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    return (
        <div className="min-h-screen bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

            <div className="relative z-10 px-6 md:px-12 lg:px-20 py-10">
                {/* Header */}
                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-semibold text-[#ff9900] tracking-wide uppercase">
                            Reservation Management
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Manage <span className="text-[#ff9900]">Reservations</span>
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 max-w-2xl">
                        View and manage all table reservations in one place.
                    </p>
                </div>

                {/* Filters Section */}
                {!loading && !error && (
                    <div className="mb-10">
                        {/* Date Category & Calendar Pick */}
                        <div className="mb-8">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                                Reservation Timeline
                            </h2>
                            <div className="flex flex-wrap items-center gap-3">
                                {[
                                    { key: "past", label: "Past", color: "bg-gray-100 text-gray-800 border-gray-200" },
                                    { key: "today", label: "Today", color: "bg-blue-100 text-blue-800 border-blue-200" },
                                    { key: "future", label: "Upcoming", color: "bg-purple-100 text-purple-800 border-purple-200" },
                                ].map(({ key, label, color }) => (
                                    <button
                                        key={key}
                                        onClick={() => handleCategoryPillClick(key as "past" | "today" | "future")}
                                        className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 border cursor-pointer ${selectedDateCategory === key && !selectedDate
                                            ? `ring-2 ring-[#ff9900] ring-offset-1 shadow-lg ${color}`
                                            : `${color} hover:shadow-md opacity-80`
                                            }`}
                                    >
                                        {label}{" "}
                                        <span className="ml-1 font-bold">
                                            ({getDateCategoryCounts()[key as keyof ReturnType<typeof getDateCategoryCounts>]})
                                        </span>
                                    </button>
                                ))}

                                {/* Divider */}
                                <div className="hidden lg:flex items-center text-gray-300 text-2xl select-none">|</div>

                                {/* Date Picker Trigger */}
                                <div className="relative" ref={calendarRef}>
                                    <button
                                        onClick={() => setShowCalendar(!showCalendar)}
                                        className={`px-4 py-2 text-xs font-semibold rounded-full transition-all duration-200 border flex items-center gap-2 cursor-pointer
                                            ${selectedDate
                                                ? "bg-[#ff9900]/10 text-[#ff9900] border-[#ff9900] ring-2 ring-[#ff9900]/30"
                                                : "border-dashed border-gray-300 text-gray-600 hover:border-[#ff9900] hover:text-[#ff9900]"
                                            }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m7 8H3V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
                                        </svg>
                                        {selectedDate ? formatSelectedDate(selectedDate) : "Pick a date"}
                                        {selectedDate && (
                                            <span
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    clearDateFilter();
                                                }}
                                                className="ml-1 w-4 h-4 rounded-full bg-gray-200 hover:bg-red-200 flex items-center justify-center transition cursor-pointer"
                                            >
                                                <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>

                                    {/* Calendar Popover */}
                                    {showCalendar && (
                                        <div className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-30 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Month Navigation */}
                                            <div className="flex items-center justify-between mb-3">
                                                <button
                                                    onClick={() => changeMonth(-1)}
                                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                </button>
                                                <span className="text-sm font-bold text-gray-800">
                                                    {calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                                                </span>
                                                <button
                                                    onClick={() => changeMonth(1)}
                                                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                                >
                                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Days of week */}
                                            <div className="grid grid-cols-7 mb-2">
                                                {daysOfWeek.map((day) => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar grid */}
                                            <div className="grid grid-cols-7 gap-1">
                                                {cells.map((cell, idx) => {
                                                    if (!cell.date) return <div key={idx} className="aspect-square"></div>;
                                                    const dateStr = cell.date.toDateString();
                                                    const isToday = isSameDay(cell.date, today);
                                                    const isSelected = selectedDate && isSameDay(cell.date, selectedDate);
                                                    const hasReservations = reservationsByDate.has(dateStr) && (reservationsByDate.get(dateStr) || 0) > 0;

                                                    return (
                                                        <button
                                                            key={idx}
                                                            disabled={!cell.isCurrentMonth}
                                                            onClick={() => cell.isCurrentMonth && cell.date && handleDateSelect(cell.date)}
                                                            className={`
                                                                aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all duration-150 relative
                                                                ${!cell.isCurrentMonth ? "text-gray-300 cursor-default" : "hover:bg-[#ff9900]/10 cursor-pointer"}
                                                                ${isSelected ? "bg-[#ff9900] text-white font-bold shadow-md" : ""}
                                                                ${isToday && !isSelected ? "ring-2 ring-[#ff9900]/50" : ""}
                                                            `}
                                                        >
                                                            {cell.day}
                                                            {hasReservations && cell.isCurrentMonth && (
                                                                <span className={`absolute bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-[#ff9900]"}`}></span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* Today button */}
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
                                                    onClick={() => setShowCalendar(false)}
                                                    className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                                                >
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Clear specific date info */}
                            {selectedDate && (
                                <div className="mt-3 flex items-center gap-2">
                                    <div className="flex items-center gap-1 px-3 py-1 bg-[#ff9900]/10 rounded-full text-sm text-[#ff9900] font-medium">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10m7 8H3V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
                                        </svg>
                                        {formatSelectedDate(selectedDate)}
                                    </div>
                                    <button onClick={clearDateFilter} className="text-sm text-gray-500 hover:text-red-500 underline cursor-pointer">
                                        Clear date
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Status Filter */}
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Reservation Status
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {["active", "cancelled"].map((status) => (
                                <button
                                    key={status}
                                    onClick={() =>
                                        setSelectedStatus(selectedStatus === status ? null : status)
                                    }
                                    className={statusPillStyle(status, selectedStatus === status)}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}{" "}
                                    <span className="ml-1 font-bold">
                                        ({statusCounts[status as keyof typeof statusCounts]})
                                    </span>
                                </button>
                            ))}
                        </div>
                        {selectedStatus && (
                            <button
                                onClick={() => setSelectedStatus(null)}
                                className="mt-3 text-sm text-[#ff9900] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {loading && <Loader message="Loading reservations..." />}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                        <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700 font-semibold">{error}</p>
                        <button
                            onClick={fetchReservationsData}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredReservations.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10m7 8H3V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-500 font-medium">
                            {selectedDate
                                ? `No reservations on ${formatSelectedDate(selectedDate)}`
                                : selectedStatus
                                    ? "No reservations found for this filter combination"
                                    : `No ${selectedDateCategory} reservations`
                            }
                        </p>
                    </div>
                )}

                {/* Reservations Table */}
                {!loading && !error && filteredReservations.length > 0 && (
                    <div className="grid gap-4">
                        {filteredReservations.map((reservation) => {
                            const isPast = isPastReservation(reservation);
                            return (
                                <div
                                    key={reservation._id}
                                    className={`rounded-2xl shadow-md transition-all duration-300 border overflow-hidden ${isPast
                                        ? "bg-gray-50 border-gray-200 opacity-75 hover:shadow-md"
                                        : "bg-white border-gray-100 hover:shadow-xl"
                                        }`}
                                >
                                    <div className={`p-6 ${isPast ? "cursor-not-allowed" : "cursor-default"}`}>
                                        {/* Past Reservation Badge */}
                                        {isPast && (
                                            <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-lg">
                                                <svg
                                                    className="w-4 h-4 text-gray-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M12 22a10 10 0 100-20 10 10 0 000 20z"
                                                    />
                                                </svg>
                                                <span className="text-xs font-semibold text-gray-700">
                                                    {reservation.status === "cancelled"
                                                        ? "Cancelled"
                                                        : reservation.status === "active"
                                                            ? "Completed"
                                                            : reservation.status}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            {/* Left Section */}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between gap-4 mb-3">
                                                    <div>
                                                        <h3 className={`text-xl font-bold ${isPast ? "text-gray-600" : "text-gray-900"}`}>
                                                            {reservation.name}
                                                        </h3>
                                                        <p className={`text-sm ${isPast ? "text-gray-400" : "text-gray-500"}`}>{reservation.email}</p>
                                                        {reservation.phone && <p className={`text-sm ${isPast ? "text-gray-400" : "text-gray-500"}`}>{reservation.phone}</p>}
                                                    </div>
                                                </div>

                                                {/* Details Grid */}
                                                <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 ${isPast ? "opacity-60" : ""}`}>
                                                    <div className={`rounded-lg p-3 ${isPast ? "bg-gray-200" : "bg-gray-50"}`}>
                                                        <p className={`text-xs font-semibold uppercase ${isPast ? "text-gray-500" : "text-gray-500"}`}>Date</p>
                                                        <p className={`text-sm font-bold mt-1 ${isPast ? "text-gray-700" : "text-gray-900"}`}>
                                                            {new Date(reservation.date).toLocaleDateString("en-US", {
                                                                month: "short",
                                                                day: "numeric",
                                                                year: "numeric",
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className={`rounded-lg p-3 ${isPast ? "bg-gray-200" : "bg-gray-50"}`}>
                                                        <p className={`text-xs font-semibold uppercase ${isPast ? "text-gray-500" : "text-gray-500"}`}>Time</p>
                                                        <p className={`text-sm font-bold mt-1 ${isPast ? "text-gray-700" : "text-gray-900"}`}>{reservation.time}</p>
                                                    </div>
                                                    <div className={`rounded-lg p-3 ${isPast ? "bg-gray-200" : "bg-gray-50"}`}>
                                                        <p className={`text-xs font-semibold uppercase ${isPast ? "text-gray-500" : "text-gray-500"}`}>Guests</p>
                                                        <p className={`text-sm font-bold mt-1 ${isPast ? "text-gray-700" : "text-gray-900"}`}>{reservation.person} Person{reservation.person > 1 ? "s" : ""}</p>
                                                    </div>
                                                    <div className={`rounded-lg p-3 ${isPast ? "bg-gray-200" : "bg-gray-50"}`}>
                                                        <p className={`text-xs font-semibold uppercase ${isPast ? "text-gray-500" : "text-gray-500"}`}>Table</p>
                                                        <p className={`text-sm font-bold mt-1 ${isPast ? "text-gray-700" : "text-gray-900"}`}>
                                                            {reservation.tableNumber ? `#${reservation.tableNumber}` : "Not assigned"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Timestamp */}
                                                <p className={`text-xs mt-3 ${isPast ? "text-gray-400" : "text-gray-400"}`}>
                                                    Booked on {formatDate(reservation.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Actions - Only show for active future/today reservations, not past */}
                                        {!isPast && reservation.status?.toLowerCase() === "active" && (selectedDateCategory === "future" || selectedDateCategory === "today" || selectedDate) && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-2 justify-between">
                                                <button
                                                    onClick={() => handleStatusChange(reservation._id, "cancelled")}
                                                    disabled={updatingId === reservation._id}
                                                    className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-all duration-200 font-semibold text-sm disabled:opacity-50 cursor-pointer"
                                                >
                                                    {updatingId === reservation._id ? "Cancelling..." : "Cancel Reservation"}
                                                </button>
                                                <button
                                                    onClick={() => openModal(reservation)}
                                                    className="flex items-center justify-center bg-[#ff9900] hover:bg-[#ff8800] text-white gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold text-sm cursor-pointer"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    View Details
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && selectedReservation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="bg-linear-to-r from-[#ff9900] to-[#ff8800] text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Reservation Details</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white hover:opacity-80 transition duration-500 cursor-pointer hover:bg-[#000000] rounded-2xl p-1"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Customer Info */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide">Customer Info</h3>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Name</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{selectedReservation.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                                            <p className="text-sm font-bold text-gray-900 mt-1">{selectedReservation.email}</p>
                                        </div>
                                        {selectedReservation.phone && (
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Phone</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">{selectedReservation.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reservation Info */}
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide">Reservation Info</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    {new Date(selectedReservation.date).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Time</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">{selectedReservation.time}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Guests</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    {selectedReservation.person} Person{selectedReservation.person > 1 ? "s" : ""}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500 font-semibold uppercase">Table</p>
                                                <p className="text-sm font-bold text-gray-900 mt-1">
                                                    {selectedReservation.tableNumber ? `#${selectedReservation.tableNumber}` : "Not assigned"}
                                                </p>
                                            </div>
                                        </div>
                                        {isPastReservation(selectedReservation) && (
                                            <div className="mt-3 flex items-center">
                                                <div className="px-3 py-1.5 text-xs font-semibold rounded-full uppercase tracking-wide bg-gray-200 text-gray-700 border border-gray-300">
                                                    View Only
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedReservation.notes && (
                                <div className="mt-6">
                                    <h3 className="font-bold text-gray-900 mb-3 uppercase text-sm tracking-wide">Notes</h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">{selectedReservation.notes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="mt-6 text-xs text-gray-400 space-y-1">
                                <p>Created: {formatDate(selectedReservation.createdAt)}</p>
                                <p>Last Updated: {formatDate(selectedReservation.updatedAt)}</p>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="bg-gray-100 px-6 py-4 flex gap-3 justify-between items-center">
                            <div className="flex gap-2">
                                {!isPastReservation(selectedReservation) && selectedReservation.status?.toLowerCase() === "active" && (selectedDateCategory === "future" || selectedDateCategory === "today" || selectedDate) && (
                                    <button
                                        onClick={() => {
                                            handleStatusChange(selectedReservation._id, "cancelled");
                                            setIsModalOpen(false);
                                        }}
                                        disabled={updatingId === selectedReservation._id}
                                        className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition font-semibold disabled:opacity-50 cursor-pointer"
                                    >
                                        {updatingId === selectedReservation._id ? "Cancelling..." : "Cancel Reservation"}
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageReservation;