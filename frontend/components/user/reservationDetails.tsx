import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import { fetchReservation, updateReservation } from "../../api/manageReservation";

const EditReservation = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        person: "",
    });

    const [status, setStatus] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPast, setIsPast] = useState(false); // NEW: track if reservation is in the past
    const [isEditLocked, setIsEditLocked] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetchReservation(id!);
                const data = response.data;
                console.log(data);

                setForm({
                    name: data.name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    date: data.date || "",
                    time: data.time || "",
                    person: data.person || 1,
                });

                setStatus(data.status || "upcoming");

                // --- NEW: Check if the reservation date/time is in the past ---
                if (data.date && data.time) {
                    const [year, month, day] = data.date.split("-").map(Number);
                    const [hour, minute] = data.time.split(":").map(Number);
                    const reservationDateTime = new Date(year, month - 1, day, hour, minute);
                    const now = new Date();
                    const editLockStarts = new Date(reservationDateTime.getTime() - 60 * 60 * 1000);
                    const activeUntil = new Date(reservationDateTime.getTime() + 60 * 60 * 1000);

                    if (now >= editLockStarts) {
                        setIsEditLocked(true);
                    }

                    if (now >= reservationDateTime && now < activeUntil) {
                        setIsActive(true);
                    }

                    if (now >= activeUntil) {
                        setIsPast(true);
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load reservation details.");
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({
            ...form,
            [e.target.name]:
                e.target.name === "person" ? Number(e.target.value) : e.target.value,
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            await updateReservation(id!, form);
            alert("Reservation updated successfully.");
            navigate(`/reservations/${id}`);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || "Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        setCancelling(true);
        setError(null);
        try {
            await updateReservation(id!, { status: "cancelled" });
            setStatus("cancelled");
            setIsCancelModalOpen(false);
            navigate("/reservations");
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.message || "Cancellation failed. Please try again.");
        } finally {
            setCancelling(false);
        }
    };

    const isReservationCancelled = status === "cancelled";

    return (
        <div className="min-h-[90vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden px-6 md:px-12 lg:px-20 py-12">
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

            <div className="container mx-auto max-w-2xl relative z-10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        Edit Reservation
                    </h1>
                </div>

                {/* Status Display */}
                {status && (
                    <div className="mb-6">
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide ${isReservationCancelled
                                ? "bg-red-100 text-red-700 border border-red-300"
                                : isPast
                                    ? "bg-gray-100 text-gray-700 border border-gray-300"
                                    : "bg-orange-100 text-orange-700 border border-orange-300"
                            }`}>
                            {isReservationCancelled
                                ? "Cancelled"
                                : isPast
                                    ? "Past"
                                    : isEditLocked
                                        ? "Active"
                                        : "Upcoming"}
                        </span>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 p-8 md:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    {isReservationCancelled ? (
                        <div className="text-center py-12">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Cancelled</h2>
                            <p className="text-gray-600 mb-6">This reservation has been cancelled and cannot be edited.</p>
                            <button
                                onClick={() => navigate("/reservations")}
                                className="py-3 px-6 bg-[#ff9900] text-white font-semibold rounded-xl hover:bg-[#ff8800] transition-all"
                            >
                                Back to Reservations
                            </button>
                        </div>
                    ) : isPast ? (
                        // --- NEW: Past reservation view (fully disabled) ---
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <svg className="w-16 h-16 mx-auto text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reservation Already Passed</h2>
                            <p className="text-gray-600 mb-6">
                                This reservation took place in the past and can no longer be updated or cancelled.
                            </p>
                            <button
                                onClick={() => navigate("/reservations")}
                                className="py-3 px-6 bg-[#ff9900] text-white font-semibold rounded-xl cursor-pointer hover:bg-[#ff8800] transition-all"
                            >
                                Back to Reservations
                            </button>
                        </div>
                    ) : (
                        <>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit();
                                }}
                                className="space-y-6"
                            >
                                <div>
                                    <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                        Name
                                    </label>
                                    <input
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        disabled={isEditLocked}
                                        placeholder="Full name"
                                        className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                        Email
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        disabled={isEditLocked}
                                        placeholder="Email address"
                                        className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                        Phone
                                    </label>
                                    <input
                                        name="phone"
                                        type="tel"
                                        value={form.phone}
                                        onChange={handleChange}
                                        disabled={isEditLocked}
                                        placeholder="Phone number (optional)"
                                        className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 placeholder-gray-400 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                            Date
                                        </label>
                                        <input
                                            type="date"
                                            name="date"
                                            value={form.date}
                                            onChange={handleChange}
                                            disabled={isEditLocked}
                                            className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                            Time
                                        </label>
                                        <input
                                            type="time"
                                            name="time"
                                            value={form.time}
                                            onChange={handleChange}
                                            disabled={isEditLocked}
                                            className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-[#ff9900] uppercase tracking-wide mb-2">
                                        Number of Guests
                                    </label>
                                    <input
                                        type="number"
                                        name="person"
                                        value={form.person}
                                        onChange={handleChange}
                                        disabled={isEditLocked}
                                        min={1}
                                        className="w-full border border-gray-300 rounded-xl px-5 py-3.5 text-gray-800 bg-white/90 focus:outline-none focus:ring-2 focus:ring-[#ff9900] focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    {!isEditLocked && (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-3 px-6 bg-[#ff9900] text-white font-semibold rounded-xl cursor-pointer hover:bg-[#ff8800] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Updating..." : "Update Reservation"}
                                        </button>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => navigate("/reservations")}
                                        className="flex-1 py-3 px-6 bg-white border border-gray-300 rounded-xl font-medium text-gray-800 cursor-pointer hover:border-[#ff9900] hover:bg-gray-50 transition-all duration-200"
                                    >
                                        Go Back
                                    </button>
                                </div>
                            </form>

                            {isEditLocked && (
                                <p className="mt-6 text-center text-sm text-gray-600">
                                    Changes are locked within one hour of the reservation. You can still cancel it.
                                </p>
                            )}

                            <div className="mt-8 pt-6 border-t border-gray-200/60">
                                <button
                                    type="button"
                                    onClick={() => setIsCancelModalOpen(true)}
                                    disabled={cancelling || isActive}
                                    className="w-full py-3 px-6 bg-red-50 border border-red-200 rounded-xl font-medium text-red-700 cursor-pointer hover:bg-red-100 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {cancelling
                                        ? "Cancelling..."
                                        : isActive
                                            ? "Cannot Cancel Active Reservation"
                                            : "Cancel This Reservation"}
                                </button>
                                <p className="text-xs text-gray-500 text-center mt-3">
                                    {isActive
                                        ? "Active reservations cannot be cancelled."
                                        : "Cancelling is permanent and cannot be undone."}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby="cancel-reservation-title">
                    <button
                        type="button"
                        aria-label="Close cancellation dialog"
                        className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsCancelModalOpen(false)}
                    />
                    <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <button
                            type="button"
                            aria-label="Close cancellation dialog"
                            className="absolute right-4 top-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 cursor-pointer"
                            onClick={() => setIsCancelModalOpen(false)}
                            disabled={cancelling}
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="flex items-start gap-4 pr-8">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <h2 id="cancel-reservation-title" className="text-xl font-bold text-gray-900">
                                    Cancel reservation?
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-gray-600">
                                    This action cannot be undone. Are you sure you want to cancel this reservation?
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                disabled={cancelling}
                                className="rounded-xl border border-gray-300 px-5 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                Keep Reservation
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={cancelling}
                                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                            >
                                {cancelling ? "Cancelling..." : "Yes, Cancel Reservation"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditReservation;