'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Hospital, Ambulance } from '@/utils/hospital-service';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface HospitalMapProps {
  hospitals: Hospital[];
  selectedHospitalId?: string | null;
  ambulances?: Ambulance[];
  activeIncidents?: any[];
}

// Custom Icons
const HospitalIcon = L.divIcon({
  className: 'custom-hospital-icon',
  html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #3b82f6"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6]
});

const AmbulanceIcon = L.divIcon({
  className: 'custom-ambulance-icon',
  html: `<div style="background-color: #eab308; width: 14px; height: 14px; border-radius: 2px; border: 2px solid black; box-shadow: 0 0 10px #eab308; transform: rotate(45deg)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7]
});

const IncidentIcon = L.divIcon({
  className: 'custom-incident-icon',
  html: `<div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #ef4444; animation: pulse 1.5s infinite"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export default function HospitalMap({ hospitals, selectedHospitalId, ambulances, activeIncidents }: HospitalMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([12.9716, 77.5946]); // Bangalore Center

  useEffect(() => {
    if (selectedHospitalId) {
      const selected = hospitals.find(h => h.id === selectedHospitalId);
      if (selected) {
        setMapCenter(selected.coordinates);
      }
    }
  }, [selectedHospitalId, hospitals]);

  const getStatusColor = (hospital: Hospital) => {
    const totalBeds = hospital.beds.length;
    const availableBeds = hospital.beds.filter(b => b.status === 'Available').length;
    const ratio = availableBeds / totalBeds;
    if (ratio > 0.5) return '#22c55e'; // Green
    if (ratio > 0.2) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
      <MapContainer 
        center={mapCenter} 
        zoom={12} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        <ChangeView center={mapCenter} />
        
        {hospitals.map((hospital) => (
          <Marker 
            key={hospital.id} 
            position={hospital.coordinates}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="background-color: ${getStatusColor(hospital)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${getStatusColor(hospital)}"></div>`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })}
          >
            <Popup className="hospital-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-black text-xs uppercase tracking-tight text-white mb-1">{hospital.name}</h3>
                <p className="text-[10px] text-zinc-400 mb-2 leading-tight">{hospital.address}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {hospital.specialties.map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[8px] font-bold text-zinc-300 uppercase">{s}</span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase underline decoration-green-500/50">Available Beds</span>
                    <span className="text-sm font-black text-white italic">
                      {hospital.beds.filter(b => b.status === 'Available').length} / {hospital.beds.length}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] text-zinc-500 font-bold uppercase underline decoration-red-500/50">ICU Status</span>
                    <span className="text-sm font-black text-white italic">
                      {hospital.beds.filter(b => b.type === 'ICU' && b.status === 'Available').length} FREE
                    </span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {ambulances?.map((amb) => (
          <Marker 
            key={amb.id} 
            position={amb.coordinates} 
            icon={AmbulanceIcon}
          >
            <Popup>
              <div className="text-[10px] uppercase font-black">Ambulance: {amb.id}</div>
            </Popup>
          </Marker>
        ))}

        {activeIncidents?.map((inc, i) => (
          <Marker 
            key={i} 
            position={[inc.location.lat, inc.location.lng]} 
            icon={IncidentIcon}
          >
            <Popup>
              <div className="text-[10px] uppercase font-black text-red-500">ACCIDENT REPORTED</div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Legend Overlay */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 text-[9px] font-bold uppercase tracking-widest space-y-2 shadow-2xl">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_#22c55e]"></div>
          <span className="text-zinc-300">High Availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]"></div>
          <span className="text-zinc-300">Limited Beds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]"></div>
          <span className="text-zinc-300">Critical Status</span>
        </div>
      </div>
    </div>
  );
}
