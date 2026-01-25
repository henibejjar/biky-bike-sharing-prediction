import { useState } from 'react'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import PredictionResult from './components/PredictionResult'
import DailyForecast from './components/DailyForecast'
import { predictDemand, getDailyForecast } from './services/api'

function App() {
  const [prediction, setPrediction] = useState(null)
  const [dailyForecast, setDailyForecast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('single') // 'single' or 'daily'

  const handlePredict = async (formData) => {
    setLoading(true)
    setError(null)
    try {
      const result = await predictDemand(formData)
      setPrediction(result)
    } catch (err) {
      setError(err.message || 'Failed to get prediction')
    } finally {
      setLoading(false)
    }
  }

  const handleDailyForecast = async (params) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getDailyForecast(params)
      setDailyForecast(result)
    } catch (err) {
      setError(err.message || 'Failed to get daily forecast')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
            <button
              onClick={() => setActiveTab('single')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'single'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Single Prediction
            </button>
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Daily Forecast
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Form */}
          <div>
            <PredictionForm 
              onSubmit={activeTab === 'single' ? handlePredict : handleDailyForecast}
              loading={loading}
              mode={activeTab}
            />
          </div>

          {/* Right Column - Results */}
          <div>
            {activeTab === 'single' && prediction && (
              <PredictionResult prediction={prediction} />
            )}
            {activeTab === 'daily' && dailyForecast && (
              <DailyForecast forecast={dailyForecast} />
            )}
            {!prediction && !dailyForecast && (
              <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🚴</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Ready to Predict
                </h3>
                <p className="text-gray-500">
                  Fill in the parameters and click predict to see the demand forecast
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16 py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>© 2026 MindShift Analytics — Smart Mobility Solutions</p>
        </div>
      </footer>
    </div>
  )
}

export default App
