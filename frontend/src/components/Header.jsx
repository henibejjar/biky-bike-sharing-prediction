import { Bike, TrendingUp, Cloud } from 'lucide-react'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Bike className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Biky
              </h1>
              <p className="text-sm text-gray-500">
                AI-Powered Forecasting by VeloVision
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <div className="flex items-center text-gray-600">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              <span className="text-sm">High Accuracy</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
