import { Clock, TrendingUp, Bike } from 'lucide-react'

function DailyForecast({ forecast }) {
  const { summary } = forecast

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h3 className="text-lg font-medium opacity-90 mb-1">24-Hour Demand Forecast</h3>
        <p className="text-sm opacity-75">Summary of model predictions for the selected day</p>
      </div>

     {/* Summary Stats */}
<div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 border-b">
  <div className="text-center">
    <div className="flex items-center justify-center text-blue-600 mb-1">
      <Bike className="w-5 h-5" />
    </div>
    <div className="text-2xl font-bold text-gray-800">{summary.total_daily_rentals?.toLocaleString() ?? '-'}</div>
    <div className="text-xs text-gray-500">Total Daily</div>
  </div>

  <div className="text-center">
    <div className="flex items-center justify-center text-green-600 mb-1">
      <TrendingUp className="w-5 h-5" />
    </div>
    <div className="text-2xl font-bold text-gray-800">{summary.average_hourly ?? '-'}</div>
    <div className="text-xs text-gray-500">Avg/Hour</div>
  </div>
</div> 
    </div>
  )
}

export default DailyForecast