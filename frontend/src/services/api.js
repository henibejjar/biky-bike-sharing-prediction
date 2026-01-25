import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

/**
 * Make a single demand prediction
 */
export const predictDemand = async (formData) => {
  try {
    const response = await api.post('/predict', formData)
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Prediction failed')
    }
    throw new Error('Network error - is the backend running?')
  }
}

/**
 * Get 24-hour daily forecast
 */
export const getDailyForecast = async ({ season, weekday, weathersit, temp, hum }) => {
  try {
    const response = await api.get(
      `/predict/daily/${season}/${weekday}/${weathersit}`,
      { params: { temp, hum } }
    )
    return response.data
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.detail || 'Forecast failed')
    }
    throw new Error('Network error - is the backend running?')
  }
}

/**
 * Check API health
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('API is not available')
  }
}

export default api
