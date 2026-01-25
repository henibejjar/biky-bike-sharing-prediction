import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Clock, TrendingUp, Bike } from 'lucide-react'

function DailyForecast({ forecast }) {
  const { predictions, summary } = forecast

  // Prepare chart data
  const chartData = predictions.map(p => ({
    hour: `${p.hour}:00`,
    rentals: p.predicted_rentals,
    level: p.demand_level
  }))

  const getDemandColor = (level) => {
    switch (level) {
      case 'Very Low': return '#93c5fd'
      case 'Low': return '#67e8f9'
      case 'Moderate': return '#86efac'
      case 'High': return '#fdba74'
      case 'Very High': return '#fca5a5'
      default: return '#d1d5db'
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h3 className="text-lg font-medium opacity-90 mb-1">24-Hour Demand Forecast</h3>
        <p className="text-sm opacity-75">Hourly predictions for the selected day</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-600 mb-1">
            <Bike className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.total_daily_rentals.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Total Daily</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-green-600 mb-1">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.average_hourly}</div>
          <div className="text-xs text-gray-500">Avg/Hour</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-orange-600 mb-1">
            <Clock className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{summary.peak_hour}:00</div>
          <div className="text-xs text-gray-500">Peak Hour</div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRentals" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="hour" 
              tick={{ fontSize: 11 }}
              interval={2}
            />
            <YAxis 
              tick={{ fontSize: 11 }}
              label={{ value: 'Bikes', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value, name) => [`${value} bikes`, 'Predicted']}
            />
            <Area 
              type="monotone" 
              dataKey="rentals" 
              stroke="#3b82f6" 
              fill="url(#colorRentals)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hourly Breakdown */}
      <div className="px-4 pb-4">
        <h4 className="font-medium text-gray-700 mb-3">Hourly Breakdown</h4>
        <div className="grid grid-cols-6 gap-2 text-center text-xs">
          {predictions.map((p) => (
            <div 
              key={p.hour} 
              className="p-2 rounded-lg"
              style={{ backgroundColor: getDemandColor(p.demand_level) + '40' }}
            >
              <div className="font-medium text-gray-700">{p.hour}:00</div>
              <div className="font-bold text-gray-800">{p.predicted_rentals}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DailyForecast
