import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import AlertManagement from './pages/AlertManagement'
import MetricSimulation from './pages/MetricSimulation'
import AlertEvents from './pages/AlertEvents'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<AlertManagement />} />
          <Route path="/alerts" element={<AlertManagement />} />
          <Route path="/metrics" element={<MetricSimulation />} />
          <Route path="/events" element={<AlertEvents />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
