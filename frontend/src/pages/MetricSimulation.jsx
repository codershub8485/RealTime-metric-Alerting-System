import { useState } from 'react'
import { Activity, Send } from 'lucide-react'
import axios from 'axios'

const MetricSimulation = () => {
  const [metrics, setMetrics] = useState([
    { name: 'cpu_usage', value: '', unit: '%' },
    { name: 'memory_usage', value: '', unit: '%' },
    { name: 'disk_usage', value: '', unit: '%' },
    { name: 'api_latency', value: '', unit: 'ms' },
    { name: 'error_rate', value: '', unit: '%' }
  ])
  const [customMetric, setCustomMetric] = useState({ name: '', value: '', unit: '' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleMetricChange = (index, field, value) => {
    const updatedMetrics = [...metrics]
    updatedMetrics[index][field] = value
    setMetrics(updatedMetrics)
  }

  const handleCustomMetricChange = (field, value) => {
    setCustomMetric(prev => ({ ...prev, [field]: value }))
  }

  const submitMetric = async (metricName, value) => {
    if (!value || isNaN(value)) {
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/metrics', {
        metric_name: metricName,
        value: parseFloat(value)
      })
      setResult({
        success: true,
        message: response.data.message,
        metric: metricName,
        value: parseFloat(value)
      })
    } catch (error) {
      setResult({
        success: false,
        message: error.response?.data?.detail || 'Error submitting metric',
        metric: metricName,
        value: parseFloat(value)
      })
    } finally {
      setLoading(false)
      setTimeout(() => setResult(null), 3000)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const promises = metrics
      .filter(metric => metric.value && !isNaN(metric.value))
      .map(metric => submitMetric(metric.name, metric.value))

    if (customMetric.name && customMetric.value && !isNaN(customMetric.value)) {
      promises.push(submitMetric(customMetric.name, customMetric.value))
    }

    await Promise.all(promises)
  }

  const submitSingleMetric = async (metricName, value) => {
    await submitMetric(metricName, value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Metric Simulation</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Submit Metric Data</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <div key={metric.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {metric.name.replace('_', ' ').toUpperCase()}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    value={metric.value}
                    onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                  <span className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-600">
                    {metric.unit}
                  </span>
                  <button
                    type="button"
                    onClick={() => submitSingleMetric(metric.name, metric.value)}
                    disabled={!metric.value || isNaN(metric.value) || loading}
                    className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Custom Metric</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                value={customMetric.name}
                onChange={(e) => handleCustomMetricChange('name', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Metric name"
              />
              <input
                type="number"
                step="0.01"
                value={customMetric.value}
                onChange={(e) => handleCustomMetricChange('value', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Value"
              />
              <input
                type="text"
                value={customMetric.unit}
                onChange={(e) => handleCustomMetricChange('unit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit (optional)"
              />
              <button
                type="button"
                onClick={() => submitSingleMetric(customMetric.name, customMetric.value)}
                disabled={!customMetric.name || !customMetric.value || isNaN(customMetric.value) || loading}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  <span>Submit All Metrics</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div className={`p-4 rounded-md ${
          result.success 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className="font-medium">
              {result.success ? '✓' : '✗'}
            </span>
            <span>
              {result.metric}: {result.value}
            </span>
            <span className="text-sm">
              - {result.message}
            </span>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Quick Test Values</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">To trigger alerts:</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• CPU Usage: 85+ (if alert set to &gt;80)</li>
              <li>• Memory Usage: 90+ (if alert set to &gt;85)</li>
              <li>• API Latency: 500+ (if alert set to &gt;300)</li>
              <li>• Error Rate: 5+ (if alert set to &gt;3)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700">Normal values:</p>
            <ul className="mt-2 space-y-1 text-gray-600">
              <li>• CPU Usage: 20-60</li>
              <li>• Memory Usage: 30-70</li>
              <li>• API Latency: 50-200</li>
              <li>• Error Rate: 0-2</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MetricSimulation
