import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import axios from 'axios'

const AlertManagement = () => {
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    metric_name: '',
    threshold: '',
    comparator: 'GT',
    alert_message: ''
  })

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      const response = await axios.get('/api/alerts')
      setAlerts(response.data)
    } catch (error) {
      console.error('Error fetching alerts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/alerts', formData)
      setFormData({ metric_name: '', threshold: '', comparator: 'GT', alert_message: '' })
      setShowForm(false)
      fetchAlerts()
    } catch (error) {
      console.error('Error creating alert:', error)
    }
  }

  const handleDelete = async (alertId) => {
    try {
      await axios.delete(`/api/alerts/${alertId}`)
      fetchAlerts()
    } catch (error) {
      console.error('Error deleting alert:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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
        <h1 className="text-3xl font-bold text-gray-900">Alert Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Alert</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Create New Alert</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metric Name
              </label>
              <input
                type="text"
                name="metric_name"
                value={formData.metric_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="threshold"
                  value={formData.threshold}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comparator
                </label>
                <select
                  name="comparator"
                  value={formData.comparator}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GT">Greater Than (&gt;)</option>
                  <option value="LT">Less Than (&lt;)</option>
                  <option value="GTE">Greater Than or Equal (&gt;=)</option>
                  <option value="LTE">Less Than or Equal (&lt;=)</option>
                  <option value="EQ">Equal (=)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Message
              </label>
              <textarea
                name="alert_message"
                value={formData.alert_message}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Alert
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {alerts.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No alerts configured yet</p>
            <p className="text-sm text-gray-400 mt-2">Create your first alert to get started</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{alert.metric_name}</h3>
                  <p className="text-gray-600 mt-1">
                    Alert when {alert.metric_name} is{' '}
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                      {alert.comparator} {alert.threshold}
                    </span>
                  </p>
                  <p className="text-gray-700 mt-2">{alert.alert_message}</p>
                  <p className="text-sm text-gray-500 mt-3">
                    Created: {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AlertManagement
