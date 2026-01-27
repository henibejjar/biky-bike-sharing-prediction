import React from 'react'

export default function StationList({ stations = [], routes = [] }) {
  return (
    <div>
      <h3 className="font-medium mb-2">Stations</h3>
      <ul className="space-y-3 text-sm">
        {stations.map(s => (
          <li key={s.id} className="flex justify-between items-center">
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-gray-500">{s.status_text}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{s.prediction?.predicted_rentals ?? s.current} / {s.capacity}</div>
              <div className="text-xs text-gray-500">{s.prediction?.demand_level ?? s.force_type}</div>
              <div className="text-xs text-gray-400">CI: {s.prediction?.confidence_low} - {s.prediction?.confidence_high}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <h4 className="font-medium">Planned Routes</h4>
        <ul className="text-sm mt-2">
          {routes.map((r, i) => (
            <li key={i} className="mb-2">Route {i+1}: {r.msg}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}