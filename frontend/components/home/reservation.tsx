function Reservation() {
    return (
        <div className="reservation w-full h-[80vh] flex justify-center items-center relative">
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="relative form bg-white/25 backdrop-blur-[1px] p-12 min-h-[520px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] flex justify-center items-center">

                <form action="" className="flex flex-col items-center gap-6 w-full max-w-3xl">
                    <h3 className="uppercase text-white tracking-[0.5rem] border-t border-b border-[#ff9900] w-fit">Reservation</h3>
                    <h1 className="text-4xl font-bold text-white text-shadow-lg">Book your table now</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
                        <input
                            type="text"
                            placeholder="Name"
                            className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                            required
                        />

                        <div className="md:col-span-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                    type="number"
                                    placeholder="Person"
                                    className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                                    required
                                />
                                <input
                                    type="time"
                                    className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                                    required
                                />
                                <input
                                    type="date"
                                    className="bg-white p-4 rounded-lg border border-gray-300 focus:outline-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <button className="bg-[#ff9900] text-white px-6 py-4 cursor-pointer rounded-lg font-bold hover:bg-[#ff8800] transition">
                        Book a Table
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Reservation