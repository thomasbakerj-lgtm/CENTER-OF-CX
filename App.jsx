import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import PlatformsTech from './PlatformsTech'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/platforms-and-tech" element={<PlatformsTech />} />
      </Routes>
    </BrowserRouter>
  )
}
