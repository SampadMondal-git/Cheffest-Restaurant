import location from '../../src/assets/icons/location.png';
import time from '../../src/assets/icons/clock.png';
import reservation from '../../src/assets/icons/reservation.png';

function Info() {
    return (
        <div className="details-container flex flex-col md:flex-row justify-between gap-4 md:gap-0 px-4 md:px-12 my-6 md:my-12">
            <div className="detail-card bg-white p-4 md:p-6 flex items-center w-full md:w-auto 
                            md:shadow-none md:rounded-none 
                            rounded-2xl shadow-lg border-l-4 border-[#ff9900] md:border-l-0">
                <div className="logo w-12 md:w-15 h-12 md:h-15 flex items-center justify-center 
                                bg-[#ff9900] rounded-full shrink-0 
                                md:bg-[#ff9900]">
                    <img src={location} alt="Location Logo" className="w-5 md:w-6 h-5 md:h-6" />
                </div>
                <div className="info ml-3 md:ml-4">
                    <h2 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-start 
                                   text-gray-800 md:text-gray-900">
                        Locate Us
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">Park Street, Kolkata, West Bengal 700016</p>
                </div>
            </div>

            <div className="detail-card bg-white p-4 md:p-6 flex items-center w-full md:w-auto 
                            md:shadow-none md:rounded-none 
                            rounded-2xl shadow-lg border-l-4 border-[#ff9900] md:border-l-0">
                <div className="logo w-12 md:w-15 h-12 md:h-15 flex items-center justify-center 
                                bg-[#ff9900] rounded-full shrink-0 
                                md:bg-[#ff9900]">
                    <img src={time} alt="Clock Logo" className="w-5 md:w-6 h-5 md:h-6" />
                </div>
                <div className="info ml-3 md:ml-4">
                    <h2 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-start 
                                   text-gray-800 md:text-gray-900">
                        Open Hours
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">Serving 24/7</p>
                </div>
            </div>

            <div className="detail-card bg-white p-4 md:p-6 flex items-center w-full md:w-auto 
                            md:shadow-none md:rounded-none 
                            rounded-2xl shadow-lg border-l-4 border-[#ff9900] md:border-l-0">
                <div className="logo w-12 md:w-15 h-12 md:h-15 flex items-center justify-center 
                                bg-[#ff9900] rounded-full shrink-0 
                                md:bg-[#ff9900]">
                    <img src={reservation} alt="Reservation Logo" className="w-5 md:w-6 h-5 md:h-6" />
                </div>
                <div className="info ml-3 md:ml-4">
                    <h2 className="text-base md:text-xl font-bold mb-1 md:mb-2 text-start 
                                   text-gray-800 md:text-gray-900">
                        Make a Reservation
                    </h2>
                    <p className="text-sm md:text-base text-gray-600">Book your table in advance</p>
                </div>
            </div>
        </div>
    );
}

export default Info;