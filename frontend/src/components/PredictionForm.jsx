import { useState } from 'react'
import { Sun, Cloud, CloudRain, CloudLightning, Loader2 } from 'lucide-react'

function PredictionForm({ onSubmit, loading, mode }) {
  const [formData, setFormData] = useState({
    season: 3,
    hour: 17,
    weekday: 2,
    workingday: 1,
    weathersit: 1,
    temp: 0.5,
    atemp: 0.5,
    hum: 0.5,
    windspeed: 0.2,
    holiday: 0
  })

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'range' ? parseFloat(value) : parseInt(value)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mode === 'single') {
      onSubmit(formData)
    } else {
      onSubmit({
        season: formData.season,
        weekday: formData.weekday,
        weathersit: formData.weathersit,
        temp: formData.temp,
        hum: formData.hum
      })
    }
  }

  const seasons = [
    { value: 1, label: '❄️ Winter', color: 'bg-blue-100 border-blue-300' },
    { value: 2, label: '🌸 Spring', color: 'bg-green-100 border-green-300' },
    { value: 3, label: '☀️ Summer', color: 'bg-yellow-100 border-yellow-300' },
    { value: 4, label: '🍂 Fall', color: 'bg-orange-100 border-orange-300' }
  ]

  const weatherOptions = [
    { value: 1, label: 'Clear', icon: Sun, color: 'text-yellow-500' },
    { value: 2, label: 'Mist/Cloudy', icon: Cloud, color: 'text-gray-500' },
    { value: 3, label: 'Light Rain', icon: CloudRain, color: 'text-blue-500' },
    { value: 4, label: 'Heavy Rain', icon: CloudLightning, color: 'text-purple-500' }
  ]

  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {mode === 'single' ? '📊 Prediction Parameters' : '📅 Daily Forecast Parameters'}
      </h2>

      {/* Season Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Season</label>
        <div className="grid grid-cols-4 gap-2">
          {seasons.map(season => (
            <button
              key={season.value}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, season: season.value }))}
              className={`p-3 rounded-lg border-2 text-center text-sm font-medium transition-all ${
                formData.season === season.value
                  ? `${season.color} border-2`
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {season.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weather Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Weather Condition</label>
        <div className="grid grid-cols-4 gap-2">
          {weatherOptions.map(weather => {
            const Icon = weather.icon
            return (
              <button
                key={weather.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, weathersit: weather.value }))}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.weathersit === weather.value
                    ? 'bg-blue-50 border-blue-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-6 h-6 mx-auto mb-1 ${weather.color}`} />
                <span className="text-xs">{weather.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Hour Selection (only for single prediction) */}
      {mode === 'single' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hour of Day: <span className="font-bold text-blue-600">{formData.hour}:00</span>
          </label>
          <input
            type="range"
            name="hour"
            min="0"
            max="23"
            value={formData.hour}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>00:00</span>
            <span>06:00</span>
            <span>12:00</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>
      )}

      {/* Weekday Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
        <select
          name="weekday"
          value={formData.weekday}
          onChange={handleChange}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {weekdays.map((day, index) => (
            <option key={index} value={index}>{day}</option>
          ))}
        </select>
      </div>

      {/* Working Day Toggle (only for single prediction) */}
      {mode === 'single' && (
        <div className="mb-6">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.workingday === 1}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                workingday: e.target.checked ? 1 : 0 
              }))}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">Working Day</span>
          </label>
        </div>
      )}

      {/* Temperature Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Temperature: <span className="font-bold text-blue-600">{(formData.temp * 41).toFixed(1)}°C</span>
        </label>
        <input
          type="range"
          name="temp"
          min="0"
          max="1"
          step="0.05"
          value={formData.temp}
          onChange={(e) => setFormData(prev => ({ 
            ...prev, 
            temp: parseFloat(e.target.value),
            atemp: parseFloat(e.target.value)
          }))}
          className="w-full h-2 bg-gradient-to-r from-blue-400 via-green-400 to-red-400 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°C</span>
          <span>20°C</span>
          <span>41°C</span>
        </div>
      </div>

      {/* Humidity Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Humidity: <span className="font-bold text-blue-600">{(formData.hum * 100).toFixed(0)}%</span>
        </label>
        <input
          type="range"
          name="hum"
          min="0"
          max="1"
          step="0.05"
          value={formData.hum}
          onChange={handleChange}
          className="w-full h-2 bg-gradient-to-r from-yellow-200 to-blue-500 rounded-lg appearance-none cursor-pointer"
        />
      </div>

      {/* Wind Speed Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Wind Speed: <span className="font-bold text-blue-600">{(formData.windspeed * 67).toFixed(1)} km/h</span>
        </label>
        <input
          type="range"
          name="windspeed"
          min="0"
          max="1"
          step="0.05"
          value={formData.windspeed}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Predicting...
          </>
        ) : (
          <>
            🔮 {mode === 'single' ? 'Predict Demand' : 'Generate Forecast'}
          </>
        )}
      </button>
    </form>
  )
}

export default PredictionForm
