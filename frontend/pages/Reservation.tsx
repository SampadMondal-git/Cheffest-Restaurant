import ReservationForm from '../components/reservation/reservation-form'
import Gallery from '../components/about/gallery'

function Reservation() {
    return (
        <div className="w-full overflow-x-hidden">
            <ReservationForm />
            <Gallery />
        </div>
    )
}

export default Reservation