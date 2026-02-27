import Base from '../components/about/about'
import Facilities from '../components/about/facilities'
import Story from '../components/home/story'
import Chef from '../components/about/chef'
import Gallery from '../components/about/gallery'
import Reservation from '../components/home/reservation'
function About() {
    return (
        <>
            <Base year={2017} />
            <Facilities />
            <Story />
            <Chef />
            <Gallery />
            <Reservation />
        </>
    )
}

export default About