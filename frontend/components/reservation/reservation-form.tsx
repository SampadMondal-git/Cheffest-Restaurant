import { useState } from "react";
import { BookTableForm } from "../../api/manageReservation";

function ReservationForm() {

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [person, setPerson] = useState('');
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
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="flex justify-center items-center flex-col py-12 gap-4 text-center">
            <h1 className="text-lg uppercase border-t border-b border-[#ff9900] font-bold tracking-[0.5rem]">Reservation</h1>
            <h1 className="font-bold text-4xl">Book The Seat Now Here Easily</h1>
            <div className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-16 md:py-24 gap-12">
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative">
                        {/* Modern glass effect container */}
                        <div className="relative w-full max-w-[500px]">
                            {/* Glassmorphism frame */}
                            <div className="absolute -inset-4 bg-linear-to-r from-orange-500/10 to-amber-400/10 rounded-3xl backdrop-blur-sm border border-white/20"></div>

                            {/* Main image with layered effect */}
                            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1599458252573-56ae36120de1?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                    className="w-full h-[500px] object-cover transform hover:scale-110 transition-transform duration-700"
                                    alt="Restaurant interior" loading="lazy"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>

                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2 max-w-3xl flex flex-col gap-6">
                    <h3 className="uppercase text-lg border-t border-b border-[#ff9900] font-bold w-fit tracking-[0.3rem]">Book Now</h3>
                    <h1 className="text-4xl text-start md:text-4xl font-bold">Book Your Table Now</h1>
                    <p className="text-lg text-start md:text-xl">
                        The people, food and the prime locations make Rodich the perfect place good friends & family to come together and have a great time.
                    </p>

                    <div className="form max-w-xl">
                        <form className="grid grid-cols-2 gap-4" onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />

                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />

                            <input
                                type="text"
                                placeholder="Phone (Optional)"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />

                            <input
                                type="date"
                                placeholder="Date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />

                            <input
                                type="time"
                                placeholder="Time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />

                            <input
                                type="number"
                                placeholder="Person"
                                min="1"
                                value={person}
                                onChange={(e) => setPerson(e.target.value)}
                                className="col-span-1 border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />

                            <button
                                type="submit"
                                className="col-span-2 mt-4 bg-[#ff9900] text-white font-semibold py-3 rounded-md hover:bg-[#ff8800] transition cursor-pointer"
                            // onClick={handleSubmit}
                            >
                                Book a Table
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ReservationForm