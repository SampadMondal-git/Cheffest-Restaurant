import '../src/App.css'
import { useEffect } from 'react'
import Welcome from '../components/home/welcome'
import Info from '../components/home/info'
import Story from '../components/home/story'
import Menu from '../components/home/menu-chunks'
import Service from '../components/home/service'
import Testimonial from '../components/home/testimonial'
import Reservation from '../components/home/reservation'
function App() {
  useEffect(() => {
    window.scrollTo(0, 0);
}, []);

  return (
    <>
    <Welcome title="Cheffest" />
    <Info />
    <Story />
    <Menu />
    <Service />
    <Testimonial />
    <Reservation />
    </>
  )
}

export default App
