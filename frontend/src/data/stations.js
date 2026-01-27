// Modular station DB + simulation + routing logic + lightweight predictor

export const stationsDb = [
  { id: 1, name: "Union Station", lat: 38.897957, lon: -77.005777, capacity: 60, force_type: "SOURCE" },
  { id: 2, name: "Lincoln Memorial", lat: 38.889269, lon: -77.050176, capacity: 35, force_type: "SOURCE" },
  { id: 3, name: "Georgetown Harbor", lat: 38.902647, lon: -77.060773, capacity: 30, force_type: "SOURCE" },
  { id: 4, name: "Dupont Circle", lat: 38.909677, lon: -77.043428, capacity: 50, force_type: "SINK" },
  { id: 5, name: "Nationals Park", lat: 38.872782, lon: -77.007421, capacity: 55, force_type: "SINK" },
  { id: 6, name: "Adams Morgan", lat: 38.922895, lon: -77.041595, capacity: 25, force_type: "SINK" },
  { id: 7, name: "White House", lat: 38.895624, lon: -77.036662, capacity: 40, force_type: "NORMAL" },
  { id: 8, name: "Capitol Hill", lat: 38.889939, lon: -77.00905, capacity: 45, force_type: "NORMAL" },
  { id: 9, name: "National Zoo", lat: 38.929473, lon: -77.049683, capacity: 40, force_type: "NORMAL" },
  { id: 10, name: "Columbia Heights", lat: 38.928882, lon: -77.032338, capacity: 30, force_type: "NORMAL" }
]

export function runSimulation(db = stationsDb) {
  return db.map(s => {
    let current, status_text, color, icon
    if (s.force_type === 'SINK') {
      current = 2
      status_text = '🔴 HIGH DEMAND'
      color = 'red'
      icon = 'sink'
    } else if (s.force_type === 'SOURCE') {
      current = Math.max(0, s.capacity - 2)
      status_text = '🔵 LOW DEMAND (Overflow)'
      color = 'blue'
      icon = 'source'
    } else {
      current = Math.floor(s.capacity / 2)
      status_text = '🟢 Normal Status'
      color = 'green'
      icon = 'normal'
    }
    return { ...s, current, status_text, color, icon }
  })
}

export function calculateRoutes(simulatedData) {
  const routes = []
  const sources = simulatedData.filter(s => s.force_type === 'SOURCE')
  const sinks = simulatedData.filter(s => s.force_type === 'SINK')
  for (let i = 0; i < Math.min(sources.length, sinks.length); i++) {
    const source = sources[i]
    const sink = sinks[i]
    const transfer_amount = 15
    routes.push({
      coords: [[source.lat, source.lon], [sink.lat, sink.lon]],
      amount: transfer_amount,
      msg: `Move ${transfer_amount} bikes`,
      from: source.id,
      to: sink.id
    })
  }
  return routes
}

// ----------------------------
// Lightweight client-side predictor
// Mirrors backend's mock formula for consistency
// ----------------------------
function getDemandLevel(rentals) {
  if (rentals < 50) return "Very Low"
  if (rentals < 150) return "Low"
  if (rentals < 300) return "Moderate"
  if (rentals < 500) return "High"
  return "Very High"
}

function getRecommendations(rentals, hour, weathersit) {
  const recs = []
  const level = getDemandLevel(rentals)
  if (level === "High" || level === "Very High") {
    recs.push("Increase bike availability at popular stations")
    recs.push("Consider additional rebalancing staff")
    if ((7 <= hour && hour <= 9) || (17 <= hour && hour <= 19)) {
      recs.push("Peak commute hours - maximize station capacity")
    }
  }
  if (level === "Very Low" || level === "Low") {
    recs.push("Good time for maintenance")
  }
  if (weathersit >= 3) {
    recs.push("Bad weather - reduce fleet exposure")
  }
  if (recs.length === 0) recs.push("Normal operations")
  return recs
}

/**
 * Predict a simple demand number for a station
 * options: { hour, temp(0-1), season(1-4), weathersit(1-4), weekday(0-6) }
 */
export function predictStation(station, options = {}) {
  const now = new Date()
  const hour = options.hour ?? now.getHours()
  const temp = options.temp ?? 0.5
  const season = options.season ?? 3
  const weathersit = options.weathersit ?? 1
  const weekday = options.weekday ?? now.getDay()
  const workingday = options.workingday ?? (weekday !== 0 && weekday !== 6 ? 1 : 0)

  // base influenced by station capacity and generic seasonal/temp signals
  let base = 50 + (station.capacity * 0.8) + (temp * 200) + (season * 20)

  // adjust for station force_type (sources likely have more bikes, sinks more demand)
  if (station.force_type === 'SOURCE') base *= 0.9
  if (station.force_type === 'SINK') base *= 1.2

  // commute boost
  if (workingday && ((7 <= hour && hour <= 9) || (17 <= hour && hour <= 19))) base *= 1.4

  // weather penalty
  if (weathersit >= 3) base *= 0.6

  const predicted = Math.max(0, Math.round(base))
  const margin = Math.max(5, Math.round(predicted * 0.18))
  const low = Math.max(0, predicted - margin)
  const high = predicted + margin

  return {
    predicted_rentals: predicted,
    confidence_low: low,
    confidence_high: high,
    demand_level: getDemandLevel(predicted),
    recommendations: getRecommendations(predicted, hour, weathersit),
    meta: {
      hour, temp, season, weathersit, weekday, workingday
    }
  }
}