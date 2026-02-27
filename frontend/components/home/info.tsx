import location from '../../src/assets/icons/location.png'
import time from '../../src/assets/icons/clock.png'
import reservation from '../../src/assets/icons/reservation.png'

function Info() {
    return (
        <div className="details-container flex justify-between px-12 my-12">
            <div className="detail-card bg-white p-6 flex items-center">
                <div className="logo w-15 h-15 flex items-center justify-center bg-[#ff9900] rounded-full">
                    <img src={location} alt="Location Logo" className="w-6 h-6" />
                </div>
                <div className="info ml-4">
                    <h2 className="text-xl font-bold mb-2 text-start">Locate Us</h2>
                    <p className="text-gray-600">Park Street, Kolkata, West Bengal 700016</p>
                </div>
            </div>
            <div className="detail-card bg-white p-6 flex items-center">
                <div className="logo w-15 h-15 flex items-center justify-center bg-[#ff9900] rounded-full">
                    <img src={time} alt="Clock Logo" className="w-6 h-6" />
                </div>
                <div className="info ml-4">
                    <h2 className="text-xl font-bold mb-2 text-start">Open Hours</h2>
                    <p className="text-gray-600">Serving 24/7</p>
                </div>
            </div>
            <div className="detail-card bg-white p-6 flex items-center">
                <div className="logo w-15 h-15 flex items-center justify-center bg-[#ff9900] rounded-full">
                    <img src={reservation} alt="Reservation Logo" className="w-6 h-6" />
                </div>
                <div className="info ml-4 mt-2">
                    <h2 className="text-xl font-bold mb-2 text-start">Make a Reservation</h2>
                    <p className="text-gray-600">Book your table in advance</p>
                </div>
            </div>
        </div>
    )
}

export default Info