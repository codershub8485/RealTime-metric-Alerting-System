import { useState, useEffect } from 'react'
import { Bell, RefreshCw, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const AlertEvents = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(fetchEvents, 5000) // Refresh every 5 seconds
    }
    return () => clearInterval(interval)
  }, [autoRefresh])

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/alert-events')
      setEvents(response.data)
    } catch (error) {
      console.error('Error fetching alert events:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  const getSeverityColor = (metricName) => {
    const severityMap = {
      'error_rate': 'text-red-600 bg-red-50 border-red-200',
      'cpu_usage': 'text-orange-600 bg-orange-50 border-orange-200',
      'memory_usage': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'disk_usage': 'text-blue-600 bg-blue-50 border-blue-200',
      'api_latency': 'text-purple-600 bg-purple-50 border-purple-200'
    }
    return severityMap[metricName] || 'text-gray-600 bg-gray-50 border-gray-200'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Alert Events</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
              autoRefresh
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>{autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}</span>
          </button>
          <button
            onClick={fetchEvents}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Alert Events ({events.length})
            </h2>
            {events.length > 0 && (
              <span className="text-sm text-gray-500">
                Latest: {formatTimestamp(events[0].timestamp)}
              </span>
            )}
          </div>
        </div>

        <div className="divide-y divide-gray-200">
          {events.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No alert events triggered yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Submit metric data that exceeds alert thresholds to see events here
              </p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(event.metric_name)}`}>
                        {event.metric_name.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatTimestamp(event.timestamp)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-gray-900 font-medium">
                        {event.alert_message}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>
                          Metric Value: <span className="font-mono font-semibold">{event.metric_value}</span>
                        </span>
                        <span className="text-gray-400">|</span>
                        <span className="text-xs text-gray-500">
                          Alert ID: {event.alert_id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {events.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Event Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Total Events:</span>
              <span className="ml-2 font-semibold text-blue-900">{events.length}</span>
            </div>
            <div>
              <span className="text-blue-700">Unique Metrics:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {[...new Set(events.map(e => e.metric_name))].length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Last Hour:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {events.filter(e => {
                  const eventTime = new Date(e.timestamp)
                  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
                  return eventTime > oneHourAgo
                }).length}
              </span>
            </div>
            <div>
              <span className="text-blue-700">Most Frequent:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {events.length > 0 ? (() => {
                  const counts = {}
                  events.forEach(e => counts[e.metric_name] = (counts[e.metric_name] || 0) + 1)
                  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0].replace('_', ' ').toUpperCase()
                })() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AlertEvents
