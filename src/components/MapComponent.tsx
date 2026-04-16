'use client';

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IncidentCluster } from '@/utils/cluster-service';

// Custom Marker Icons
const createIcon = (severity: string) => {
  const color = 
    severity === 'CRITICAL' ? '#ef4444' : 
    severity === 'HIGH' ? '#f97316' : 
    severity === 'MEDIUM' ? '#eab308' : '#22c55e';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${severity === 'CRITICAL' ? `<div class="absolute w-10 h-10 bg-red-500/30 rounded-full animate-ping"></div>` : ''}
        <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center transition-all duration-500" style="background-color: ${color}">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MapProps {
  clusters: IncidentCluster[];
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function MapComponent({ clusters }: MapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-black flex items-center justify-center text-zinc-800">Initializing Grid...</div>;

  return (
    <div className="w-full h-full relative overflow-hidden bg-black">
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <ZoomControl position="bottomright" />
        
        {clusters.map((cluster) => (
          <Marker
            key={cluster.id}
            position={cluster.coordinates}
            icon={createIcon(cluster.severity)}
          >
            <Popup className="custom-popup">
              <div className="p-2 bg-zinc-900 text-white rounded-lg border border-zinc-800">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: cluster.severity === 'CRITICAL' ? '#ef4444' : '#f97316' }}>
                  {cluster.severity} EVENT
                </div>
                <div className="font-bold text-sm mb-1">{cluster.locationName}</div>
                <div className="text-[10px] text-zinc-400">Reports: {cluster.messages.length}</div>
                <div className="text-[10px] text-zinc-400 mt-1">Status: {cluster.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Map Overlay Overlay */}
      <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-lg shadow-2xl">
          <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Live Grid Visualization</div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-bold text-zinc-300">CRITICAL</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500"></div>
              <span className="text-[10px] font-bold text-zinc-300">HIGH</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-[10px] font-bold text-zinc-300">MEDIUM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
