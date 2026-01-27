import React, { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet'
import L from 'leaflet' // Import Leaflet for custom icons
import 'leaflet/dist/leaflet.css'
import { runSimulation, calculateRoutes, predictStation } from '../data/stations'
import StationList from '../components/StationList'

// Function to create a custom icon with the number inside
const createStationIcon = (count, color) => {
  return L.divIcon({
    className: 'custom-station-icon',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">
        ${count}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15], // Center the icon
    popupAnchor: [0, -15]
  })
}

export default function RebalanceSimulation() {
  const simulated = useMemo(() => runSimulation(), [])
  
  const predictedStations = useMemo(() => {
    const hour = new Date().getHours()
    return simulated.map(s => ({
      ...s,
      prediction: predictStation(s, { hour, temp: 0.5, season: 3 })
    }))
  }, [simulated])

  const routes = useMemo(() => calculateRoutes(simulated), [simulated])

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50">
      
      {/* 1. MAP LAYER */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[38.90, -77.03]} 
          zoom={13} 
          zoomControl={false}
          style={{ height: '100%', width: '100%' }} 
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; CARTO'
          />

          {predictedStations.map(s => (
            <Marker
              key={s.id}
              position={[s.lat, s.lon]}
              icon={createStationIcon(s.current, s.color)} // <--- CUSTOM ICON HERE
            >
              <Popup>
                <div className="min-w-[180px] p-1 font-sans">
                  <h4 className="font-bold text-lg mb-1">{s.name}</h4>
                  <div className="text-xs font-bold uppercase mb-2" style={{ color: s.color }}>
                    {s.status_text}
                  </div>
                  <div className="font-bold text-gray-800">
                    Capacity: {s.capacity}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Predicted Demand: <strong>{s.prediction.predicted_rentals}</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {routes.map((r, idx) => (
            <Polyline 
              key={idx}
              positions={r.coords} 
              pathOptions={{ color: '#ef4444', weight: 4, dashArray: '10,12', opacity: 0.8 }} 
            />
          ))}
        </MapContainer>
      </div>

      {/* 2. HEADER */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
          <h2 className="text-xl font-bold text-gray-800">Fleet Optimization</h2>
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
            Live Simulation Mode
          </div>
        </div>
      </div>

      {/* 3. SIDEBAR */}
      <div className="absolute top-4 right-4 bottom-4 w-80 z-20 pointer-events-none">
        <div className="h-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden pointer-events-auto">
          <div className="p-4 border-b border-gray-100 flex-none bg-white/50">
             <h3 className="font-bold text-gray-800 flex items-center gap-2">
               Station Status
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <StationList stations={predictedStations} routes={routes} />
          </div>
        </div>
      </div>

    </div>
  )
}