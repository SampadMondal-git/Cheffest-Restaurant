import { useState, useRef, useEffect } from "react";
import { BookTable } from "../../api/manageReservation";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";

/* ---------- Popup wrapper ---------- */
function PickerPopup({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 sm:hidden"
        onClick={onClose}
      />

      <div
        className="
          fixed z-50 left-1/2 top-1/2
          -translate-x-1/2 -translate-y-1/2
          w-[min(85vw,260px)]
          sm:absolute sm:z-20 sm:left-0 sm:top-full
          sm:translate-x-0 sm:translate-y-0
          sm:mt-2 sm:w-56
          bg-white border border-gray-200
          rounded-xl shadow-2xl p-3
        "
      >
        {children}
      </div>
    </>
  );
}

/* ---------- Date Picker ---------- */
function DatePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date()
  );

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const startOfWeek = new Date(viewDate);

  startOfWeek.setDate(
    viewDate.getDate() - viewDate.getDay()
  );

  startOfWeek.setHours(0, 0, 0, 0);

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);

    d.setDate(startOfWeek.getDate() + i);

    return d;
  });

  const monthYear = viewDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const changeWeek = (delta: number) => {
    const newDate = new Date(viewDate);

    newDate.setDate(
      viewDate.getDate() + delta * 7
    );

    setViewDate(newDate);
  };

  const selectDay = (day: Date) => {
    const yyyy = day.getFullYear();
    const mm = String(day.getMonth() + 1).padStart(2, "0");
    const dd = String(day.getDate()).padStart(2, "0");

    onChange(`${yyyy}-${mm}-${dd}`);

    setOpen(false);
  };

  const displayDate = value || "Select date";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full pl-10 pr-4 py-4 text-left bg-white rounded-lg border border-gray-300 focus:outline-none ${value ? "text-gray-800" : "text-gray-400"
          }`}
      >
        {displayDate}
      </button>

      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {open && (
        <PickerPopup onClose={() => setOpen(false)}>
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => changeWeek(-1)}
            >
              <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-orange-500 cursor-pointer" />
            </button>

            <div className="font-medium text-gray-700 text-sm">
              {monthYear}
            </div>

            <button
              type="button"
              onClick={() => changeWeek(1)}
            >
              <ChevronRight className="w-5 h-5 text-gray-500 hover:text-orange-500 cursor-pointer" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-400 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
              (d) => (
                <div key={d}>{d}</div>
              )
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {weekDays.map((day) => {
              const dayStr = `${day.getFullYear()}-${String(
                day.getMonth() + 1
              ).padStart(2, "0")}-${String(
                day.getDate()
              ).padStart(2, "0")}`;

              const isSelected = value === dayStr;

              const isToday =
                day.toDateString() ===
                new Date().toDateString();

              return (
                <button
                  key={dayStr}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`aspect-square w-full rounded-full flex items-center justify-center transition ${isSelected
                    ? "bg-[#ff9900] text-white"
                    : isToday
                      ? "bg-orange-50 text-[#ff9900] font-semibold"
                      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                    }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => {
                const today = new Date();

                const yyyy = today.getFullYear();
                const mm = String(
                  today.getMonth() + 1
                ).padStart(2, "0");
                const dd = String(
                  today.getDate()
                ).padStart(2, "0");

                onChange(`${yyyy}-${mm}-${dd}`);

                setOpen(false);
              }}
              className="text-xs text-[#ff9900] font-medium hover:underline cursor-pointer"
            >
              Today
            </button>
          </div>
        </PickerPopup>
      )}
    </div>
  );
}

/* ---------- Small Time Picker ---------- */
function TimePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (time: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const [hour, minute] = value
    ? value.split(":").map(Number)
    : [12, 0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const updateTime = (
    newHour: number,
    newMinute: number
  ) => {
    newHour = Math.max(0, Math.min(23, newHour));
    newMinute = Math.max(0, Math.min(59, newMinute));

    const hh = String(newHour).padStart(2, "0");
    const mm = String(newMinute).padStart(2, "0");

    onChange(`${hh}:${mm}`);
  };

  const handleHourChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value === "") return;

    let newHour = Number(e.target.value);

    if (Number.isNaN(newHour)) return;

    if (newHour > 23) newHour = 23;
    if (newHour < 0) newHour = 0;

    updateTime(newHour, minute);
  };

  const handleMinuteChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.value === "") return;

    let newMinute = Number(e.target.value);

    if (Number.isNaN(newMinute)) return;

    if (newMinute > 59) newMinute = 59;
    if (newMinute < 0) newMinute = 0;

    updateTime(hour, newMinute);
  };

  const formatTime = () => {
    if (!value) return "Select time";

    const displayHour = hour % 12 || 12;
    const period = hour >= 12 ? "PM" : "AM";

    return `${displayHour}:${String(minute).padStart(
      2,
      "0"
    )} ${period}`;
  };

  return (
    <div ref={ref} className="relative w-full">
      {/* Main Time Field */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full pl-10 pr-4 py-4 text-left bg-white rounded-lg border border-gray-300 focus:outline-none ${value ? "text-gray-800" : "text-gray-400"
          }`}
      >
        {formatTime()}
      </button>

      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {open && (
        <PickerPopup onClose={() => setOpen(false)}>
          <div className="w-full">
            {/* Title */}
            <p className="text-sm font-semibold text-gray-700 text-center mb-4">
              Select time
            </p>

            {/* Time Inputs */}
            <div className="flex items-center justify-center gap-3">
              {/* Hour */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={String(hour).padStart(2, "0")}
                  onChange={handleHourChange}
                  className="
                    w-16
                    h-12
                    text-center
                    text-xl
                    font-semibold
                    text-gray-800
                    bg-gray-50
                    rounded-lg
                    border
                    border-gray-200
                    focus:outline-none
                    focus:border-[#ff9900]
                    [appearance:textfield]
                    [&::-webkit-inner-spin-button]:appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                  "
                />

                <span className="text-[9px] text-gray-400 mt-1.5">
                  HOUR
                </span>
              </div>

              {/* Colon */}
              <span className="text-2xl font-bold text-gray-400 mb-4">
                :
              </span>

              {/* Minute */}
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={String(minute).padStart(2, "0")}
                  onChange={handleMinuteChange}
                  className="
                    w-16
                    h-12
                    text-center
                    text-xl
                    font-semibold
                    text-gray-800
                    bg-gray-50
                    rounded-lg
                    border
                    border-gray-200
                    focus:outline-none
                    focus:border-[#ff9900]
                    [appearance:textfield]
                    [&::-webkit-inner-spin-button]:appearance-none
                    [&::-webkit-outer-spin-button]:appearance-none
                  "
                />

                <span className="text-[9px] text-gray-400 mt-1.5">
                  MINUTE
                </span>
              </div>
            </div>

            {/* Selected Time */}
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <span className="text-sm text-gray-400">
                Selected:{" "}
              </span>

              <span className="text-sm font-semibold text-[#ff9900]">
                {formatTime()}
              </span>
            </div>

            {/* Done */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="
                w-full
                mt-3
                py-2
                rounded-lg
                bg-[#ff9900]
                text-white
                text-sm
                font-semibold
                hover:bg-[#ff8800]
                transition cursor-pointer
              "
            >
              Done
            </button>
          </div>
        </PickerPopup>
      )}
    </div>
  );
}

/* ---------- Main Reservation Component ---------- */
function Reservation() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [person, setPerson] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!showSuccessAlert) return;

    const timeoutId = window.setTimeout(() => {
      setShowSuccessAlert(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [showSuccessAlert]);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!date || !time || !person) {
      setShowSuccessAlert(false);
      setMessage("Please select a date, time, and number of guests.");
      return;
    }

    setMessage("");
    setShowSuccessAlert(false);
    setIsSubmitting(true);

    try {
      const response = await BookTable(
        name,
        email,
        Number(person),
        time,
        date
      );

      console.log(response);
  setShowSuccessAlert(true);

      setName("");
      setEmail("");
      setPerson("");
      setTime("");
      setDate("");
    } catch (error) {
      console.error(error);
      setShowSuccessAlert(false);
      const responseMessage = (error as { response?: { data?: { message?: string } } })
        .response?.data?.message;
      setMessage(
        responseMessage === "Token missing" || responseMessage === "Invalid or expired token"
          ? "Please sign in before booking a table."
          : responseMessage || "We could not book your table. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="reservation w-full min-h-[80vh] flex justify-center items-center relative">
      {showSuccessAlert && (
        <div
          role="alert"
          className="fixed top-6 left-1/2 z-60 flex w-[min(92vw,420px)] -translate-x-1/2 items-start gap-3 rounded-xl border border-emerald-200 bg-white p-4 text-emerald-900 shadow-2xl"
        >
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
          <div className="flex-1">
            <p className="font-bold">Reservation confirmed</p>
            <p className="mt-1 text-sm text-gray-600">
              Your table is reserved. We look forward to welcoming you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowSuccessAlert(false)}
            aria-label="Close reservation confirmation"
            className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative form bg-white/25 backdrop-blur-[1px] p-6 md:p-12 min-h-130 shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex justify-center items-center">
        <form
          className="flex flex-col items-center gap-6 w-full max-w-3xl"
          onSubmit={handleSubmit}
        >
          <h3 className="relative uppercase text-white w-fit px-8 py-2 text-[14px] font-medium tracking-[0.32em]">
            <span className="absolute left-0 top-0 h-px w-10 bg-[#ff9900]" />
            <span className="absolute right-0 bottom-0 h-px w-10 bg-[#ff9900]" />

            <span className="relative flex items-center gap-4">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#ff9900]" />
              <span className="text-lg font-bold tracking-[0.3em] text-shadow-lg">
                Reservation
              </span>
              <span className="h-1.5 w-1.5 rotate-45 bg-[#ff9900]" />
            </span>
          </h3>

          <h1 className="text-3xl lg:text-4xl font-bold text-white text-shadow-lg text-center">
            Book Your Table Now
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
            {/* Name */}
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
              required
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
              required
            />

            <div className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Person */}
                <input
                  type="number"
                  placeholder="Person"
                  value={person}
                  onChange={(e) =>
                    setPerson(e.target.value)
                  }
                  className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                  required
                />

                {/* Time */}
                <TimePicker
                  value={time}
                  onChange={setTime}
                />

                {/* Date */}
                <DatePicker
                  value={date}
                  onChange={setDate}
                />
              </div>
            </div>
          </div>

          {message && (
            <p role="alert" className="-mt-3 text-center text-sm font-medium text-red-200">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#ff9900] text-white px-6 py-4 cursor-pointer rounded-lg font-bold hover:bg-[#ff8800] transition"
          >
            {isSubmitting ? "Booking..." : "Book a Table"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Reservation;