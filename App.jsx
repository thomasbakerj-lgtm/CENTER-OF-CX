import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import PlatformsTech from './PlatformsTech'
import About from './About'
import Advisory from './Advisory'
import Contact from './Contact'
import Subscribe from './Subscribe'

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
      </Routes>
    </BrowserRouter>
  )
}
