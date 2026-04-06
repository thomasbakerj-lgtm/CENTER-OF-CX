import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import PlatformsTech from './PlatformsTech'
import About from './About'
import Advisory from './Advisory'
import Contact from './Contact'
import Subscribe from './Subscribe'
import HowToChoose from './HowToChoose'
import Research from './Research'
import Vendors from './Vendors'
import Industries from './Industries'
import TCOCalculator from './TCOCalculator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/platforms-and-tech" element={<PlatformsTech />} />
        <Route path="/about" element={<About />} />
        <Route path="/advisory" element={<Advisory />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/how-to-choose" element={<HowToChoose />} />
        <Route path="/research" element={<Research />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/industries" element={<Industries />} />
        <Route path="/tco-calculator" element={<TCOCalculator />} />
      </Routes>
    </BrowserRouter>
  )
}
