import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

function PredictionResult({ prediction }) {
  const { 
    predicted_rentals, 
    confidence_low, 
    confidence_high, 
    demand_level, 
    recommendations,
    input_summary 
  } = prediction

  const getDemandColor = (level) => {
    switch (level) {
      case 'Very Low': return 'bg-blue-100 text-blue-800'
      case 'Low': return 'bg-cyan-100 text-cyan-800'
      case 'Moderate': return 'bg-green-100 text-green-800'
      case 'High': return 'bg-orange-100 text-orange-800'
      case 'Very High': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDemandIcon = (level) => {
    if (['High', 'Very High'].includes(level)) {
      return <TrendingUp className="w-5 h-5" />
    }
    if (['Low', 'Very Low'].includes(level)) {
      return <TrendingDown className="w-5 h-5" />
    }
    return <CheckCircle className="w-5 h-5" />
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header with main prediction */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h3 className="text-lg font-medium opacity-90 mb-2">Predicted Demand</h3>
        <div className="flex items-end space-x-3">
          <span className="text-5xl font-bold">{predicted_rentals}</span>
          <span className="text-xl opacity-80 pb-1">bikes/hour</span>
        </div>
        <div className="mt-3 text-sm opacity-80">
          Confidence: {confidence_low} - {confidence_high} bikes
        </div>
      </div>

      {/* Demand Level Badge */}
      <div className="px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Demand Level</span>
          <span className={`inline-flex items-center px-4 py-2 rounded-full font-medium ${getDemandColor(demand_level)}`}>
            {getDemandIcon(demand_level)}
            <span className="ml-2">{demand_level}</span>
          </span>
        </div>
      </div>

      {/* Input Summary */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-3">Input Summary</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Season:</span>
            <span className="font-medium">{input_summary.season}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time:</span>
            <span className="font-medium">{input_summary.hour}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Weather:</span>
            <span className="font-medium">{input_summary.weather}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Temperature:</span>
            <span className="font-medium">{input_summary.temperature}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Humidity:</span>
            <span className="font-medium">{input_summary.humidity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Day Type:</span>
            <span className="font-medium">{input_summary.day_type}</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-6 py-4">
        <h4 className="font-medium text-gray-700 mb-3 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
          Recommendations
        </h4>
        <ul className="space-y-2">
          {recommendations.map((rec, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <span className="mr-2">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default PredictionResult
