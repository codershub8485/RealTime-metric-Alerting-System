import { Link, useLocation } from 'react-router-dom'
import { AlertTriangle, Activity, Bell } from 'lucide-react'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-8 w-8" />
            <span className="text-xl font-bold">Alert Platform</span>
          </div>
          
          <div className="flex space-x-6">
            <Link
              to="/alerts"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/alerts') || isActive('/')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
              <span>Alerts</span>
            </Link>
            
            <Link
              to="/metrics"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/metrics')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Metrics</span>
            </Link>
            
            <Link
              to="/events"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/events')
                  ? 'bg-blue-700 text-white'
                  : 'text-blue-100 hover:bg-blue-500 hover:text-white'
              }`}
            >
              <Bell className="h-4 w-4" />
              <span>Events</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
