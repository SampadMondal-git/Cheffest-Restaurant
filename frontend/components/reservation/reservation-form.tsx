import { useState, useRef, useEffect } from "react";
import { BookTableForm } from "../../api/manageReservation";
import { useConfirmation } from "../../src/contexts/useConfirmation";
import {
  User, Mail, Phone, Calendar, Clock, BookOpen,
  ChevronLeft, ChevronRight,
} from "lucide-react";

/* ---------- Date Picker Component ---------- */
function DatePicker({
  value,
  onChange,
  required: _required = false,
}: {
  value: string;
  onChange: (date: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(
    value ? new Date(value) : new Date()
  );
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const changeMonth = (delta: number) =>
    setViewDate(new Date(year, month + delta, 1));

  const selectDay = (day: number) => {
    const d = new Date(year, month, day);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    setOpen(false);
  };

  const displayDate = value || "Select date";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full pl-10 pr-4 py-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${value ? "text-gray-800" : "text-gray-400"
          }`}
      >
        {displayDate}
      </button>
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {open && (
        <div className="absolute z-20 mt-2 w-auto min-w-full max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-2xl p-4 left-0">
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="w-5 h-5 text-gray-500 hover:text-orange-500" />
            </button>
            <div className="font-medium text-gray-700">
              {viewDate.toLocaleString("default", { month: "long" })} {year}
            </div>
            <button type="button" onClick={() => changeMonth(1)}>
              <ChevronRight className="w-5 h-5 text-gray-500 hover:text-orange-500" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {days.map((day) => {
              const current = new Date(year, month, day);
              const isToday = current.getTime() === today.getTime();
              const selected =
                value === `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-9 w-9 rounded-full flex items-center justify-center transition ${selected
                      ? "bg-[#ff9900] text-white"
                      : isToday
                        ? "bg-orange-50 text-[#ff9900] font-semibold"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Time Picker Component (independent scrolling) ---------- */
function TimePicker({
  value,
  onChange,
  required: _required = false,
}: {
  value: string;
  onChange: (time: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Parse current time or default to 12:00
  let hour = 12,
    minute = 0;
  if (value) {
    const [h, m] = value.split(":").map(Number);
    hour = h;
    minute = m;
  }

  const displayTime = value || "Select time";

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const selectTime = (h: number, m: number) => {
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    onChange(`${hh}:${mm}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full pl-10 pr-4 py-3 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition ${value ? "text-gray-800" : "text-gray-400"
          }`}
      >
        {displayTime}
      </button>
      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

      {open && (
        <div className="absolute z-20 mt-2 w-auto min-w-full max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-xl shadow-2xl p-3 left-0">
          <div className="flex gap-2">
            {/* Hour column – scrolls independently */}
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 mb-2 text-center">Hour</p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => selectTime(h, minute)}
                    className={`w-full py-1.5 text-sm rounded-md transition ${hour === h
                        ? "bg-[#ff9900] text-white font-medium"
                        : "text-gray-700 hover:bg-orange-50"
                      }`}
                  >
                    {String(h).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>

            {/* Minute column – scrolls independently */}
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-400 mb-2 text-center">Minute</p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
                {minutes.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectTime(hour, m)}
                    className={`w-full py-1.5 text-sm rounded-md transition ${minute === m
                        ? "bg-[#ff9900] text-white font-medium"
                        : "text-gray-700 hover:bg-orange-50"
                      }`}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Main Reservation Form ---------- */
function ReservationForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [person, setPerson] = useState('');

  const { setType } = useConfirmation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await BookTableForm(name, email, phone, Number(person), time, date);
      console.log(response);
      setName('');
      setEmail('');
      setPhone('');
      setPerson('');
      setTime('');
      setDate('');
      setType("booking");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-center px-4 py-8 text-center sm:px-6 lg:px-8">
      <h3 className="relative uppercase text-[#ff9900] w-fit px-8 py-2 tracking-[0.32em]">
        <span className="absolute left-0 top-0 h-px w-10 bg-[#ff9900]" />
        <span className="absolute right-0 bottom-0 h-px w-10 bg-[#ff9900]" />

        <span className="relative flex items-center gap-4">
          <span className="h-1.5 w-1.5 rotate-45 bg-[#ff9900]" />
          <span className="text-lg font-bold tracking-[0.3em]">
            Reservation
          </span>
          <span className="h-1.5 w-1.5 rotate-45 bg-[#ff9900]" />
        </span>
      </h3>
      <h1 className="mt-3 text-2xl font-bold sm:text-2xl lg:text-3xl">Book The Seat Now Here Easily</h1>
      <div className="flex w-full flex-col items-center justify-between gap-8 px-0 py-8 sm:py-12 lg:flex-row lg:gap-12 lg:px-4 lg:py-16">
        <div className="flex w-full justify-center lg:w-1/2">
          <div className="relative">
            <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-125">
              <div className="absolute -inset-4 bg-linear-to-r from-orange-500/10 to-amber-400/10 rounded-3xl backdrop-blur-sm border border-white/20"></div>
              <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1599458252573-56ae36120de1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="w-full aspect-3/2 object-cover transition-transform duration-700 hover:scale-110 lg:h-128 lg:aspect-auto"
                  alt="Restaurant interior"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-3xl flex-col gap-6 lg:w-1/2">
          <div className="flex items-center gap-4 border-b border-[#ff9900]/20 pb-4">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#ff9900]/50">
              <span className="h-2 w-2 rounded-full bg-[#ff9900] shadow-[0_0_12px_rgba(255,153,0,0.7)]" />
            </div>

            <div>
              <h3 className="text-lg font-bold uppercase tracking-[0.2em] text-start text-[#ff9900]">
                Book Now
              </h3>

              <span className="mt-1 block text-[11px] uppercase tracking-[0.3em] text-gray-400">
                Your table awaits
              </span>
            </div>
          </div>
          <h1 className="text-left text-2xl font-bold sm:text-2xl lg:text-3xl">Book Your Table Now</h1>
          <p className="text-left text-base text-gray-600 sm:text-lg lg:text-xl">
            The people, food and the prime locations make Rodich the perfect place good friends & family to come together and have a great time.
          </p>

          <div className="form max-w-xl">
            <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
              {/* Name */}
              <div className="col-span-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  required
                />
              </div>

              {/* Email */}
              <div className="col-span-1 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                  required
                />
              </div>

              {/* Phone */}
              <div className="col-span-1 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Phone (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>

              {/* Person count */}
              <div className="col-span-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  placeholder="Person"
                  min="1"
                  value={person}
                  onChange={(e) => setPerson(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400 transition [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  required
                />
              </div>

              {/* Date picker - custom */}
              <div className="col-span-1">
                <DatePicker value={date} onChange={setDate} required />
              </div>

              {/* Time picker - custom */}
              <div className="col-span-1">
                <TimePicker value={time} onChange={setTime} required />
              </div>

              <button
                type="submit"
                className="mt-4 flex items-center justify-center gap-2 rounded-md bg-[#ff9900] py-3 font-semibold text-white transition hover:bg-[#ff8800] sm:col-span-2 cursor-pointer"
              >
                <BookOpen className="w-5 h-5" />
                Book a Table
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReservationForm;