import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getReservationByUserToken } from "../../api/manageReservation";

interface Reservation {
  _id: string;
  name: string;
  date: string;       // format: "YYYY-MM-DD"
  time: string;       // format: "HH:mm"
  person: number;
  email?: string;
  status?: string;    // "cancelled", "upcoming", etc.
}

type ReservationStatus = "past" | "present" | "future" | "cancelled";

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getReservationByUserToken();
      setReservations(res.data);
    };
    fetchData();
  }, []);

  // Get status based on reservation status field or local date
  const getReservationStatus = (reservation: Reservation): ReservationStatus => {
    // Check if reservation is cancelled
    if (reservation.status === "cancelled") {
      return "cancelled";
    }

    // Otherwise, determine based on date
    const [year, month, day] = reservation.date.split("-").map(Number);
    const reservationDate = new Date(year, month - 1, day); // local midnight

    const today = new Date();
    today.setHours(0, 0, 0, 0); // local midnight today

    if (reservationDate < today) return "past";
    if (reservationDate > today) return "future";
    return "present"; // same day → "Today"
  };

  // Enrich reservations with status and sort
  const enrichedReservations = useMemo(() => {
    const enriched = reservations.map((r) => ({
      ...r,
      status: getReservationStatus(r),
    }));

    // Sort: future first, then present, then future, then past, then cancelled
    const order = { future: 0, present: 1, past: 2, cancelled: 3 };
    return enriched.sort((a, b) => order[a.status as ReservationStatus] - order[b.status as ReservationStatus]);
  }, [reservations]);

  const formatDate = (isoDate: string) => {
    // Parse as local date to avoid off-by-one issues
    const [year, month, day] = isoDate.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const statusConfig: Record<
    ReservationStatus,
    { label: string; bg: string; border: string; text: string }
  > = {
    past: {
      label: "Past",
      bg: "bg-gray-100",
      border: "border-gray-300",
      text: "text-gray-500",
    },
    present: {
      label: "Today",
      bg: "bg-green-50",
      border: "border-green-300",
      text: "text-green-700",
    },
    future: {
      label: "Upcoming",
      bg: "bg-orange-50",
      border: "border-orange-300",
      text: "text-orange-600",
    },
    cancelled: {
      label: "Cancelled",
      bg: "bg-red-50",
      border: "border-red-300",
      text: "text-red-600",
    },
  };

  return (
    <div className="min-h-[65vh] bg-linear-to-br from-[#fffaf3] to-[#ffe8c8] relative overflow-hidden px-6 md:px-12 lg:px-20 py-12">
      {/* Decorative blobs (same as Welcome) */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#ff9900]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ff9900]/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto relative z-10">
        {/* Header with green dot */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            My Reservations
          </h1>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-10 text-center border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-lg">You have no reservations yet.</p>
            <button
              onClick={() => navigate("/reservation")}
              className="mt-6 px-6 py-3 bg-linear-to-r from-gray-900 to-black text-white font-semibold rounded-xl cursor-pointer hover:shadow-lg transition-all"
            >
              Book a Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrichedReservations.map((r) => {
              const config = statusConfig[r.status];
              const isPast = r.status === "past";
              const isCancelled = r.status === "cancelled";

              return (
                <div
                  key={r._id}
                  onClick={() => !isCancelled && navigate(`/reservations/${r._id}`)}
                  className={`relative bg-white/80 backdrop-blur-sm rounded-2xl p-6 border shadow-md hover:shadow-lg transition-all duration-200 ${isCancelled ? "cursor-not-allowed" : "cursor-pointer"
                    } ${config.border} ${isPast || isCancelled ? "opacity-70" : ""
                    }`}
                >
                  {/* Status badge */}
                  <div
                    className={`absolute -top-3 left-4 px-4 py-1 rounded-full text-xs font-semibold uppercase tracking-wide shadow-sm ${config.bg} ${config.text} border ${config.border}`}
                  >
                    {config.label}
                  </div>

                  {/* Guest name */}
                  <div className="mb-4 mt-2">
                    <span className="text-sm font-semibold text-[#ff9900] uppercase tracking-wide">
                      Guest Name
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {r.name}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Date
                      </span>
                      <p className="font-medium text-gray-800">
                        {formatDate(r.date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Time
                      </span>
                      <p className="font-medium text-gray-800">{r.time}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        Guests
                      </span>
                      <p className="font-medium text-gray-800">
                        {r.person} {r.person === 1 ? "person" : "people"}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 pt-4 border-t border-gray-200/60 flex justify-end">
                    <span className="text-sm text-[#ff9900] font-medium flex items-center gap-1">
                      View Details
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;