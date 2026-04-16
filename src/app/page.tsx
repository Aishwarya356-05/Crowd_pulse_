'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import { IncidentCluster, getClusters, processNewMessage, assignResponder, clearAllIncidents } from '@/utils/cluster-service';
import { ParsedMessage, parseEmergencyMessage } from '@/utils/ai-pipeline';

// Dynamically import Map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 uppercase tracking-widest font-bold">Synchronizing Grid...</div>
});

export default function Page() {
  const [clusters, setClusters] = useState<IncidentCluster[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Simulation Logic
  const handleNewIncident = useCallback((message: ParsedMessage) => {
    processNewMessage(message);
    setClusters([...getClusters()]);
    setLastUpdate(Date.now());
    
    // Play alert sound if critical
    if (message.entities.severityLevel === 'CRITICAL') {
      const audio = new Audio('/alert.mp3');
      audio.play().catch(() => {}); // Browser might block auto-play
    }
  }, []);

  const handleAssign = (id: string) => {
    assignResponder(id);
    setClusters([...getClusters()]);
    setLastUpdate(Date.now());
  };

  const handleSimulateDisaster = () => {
    clearAllIncidents();
    const demoMessages = [
      "Large explosion heard near MG Road, many injured",
      "Building collapse at Indiranagar, people trapped",
      "Minor car accident on Koramangala bridge, no major injuries",
      "Fire broke out in textile shop, Electronic City, spreading fast",
      "Unresponsive person found at Jayanagar metro station",
      "3 people injured in gas leak at Hebbal warehouse",
      "Minor scuffle at Whitefield mall, security on site",
      "Heavy bleeding from accident at MG Road",
    ];

    demoMessages.forEach((text, i) => {
      setTimeout(() => {
        const parsed = parseEmergencyMessage(text);
        handleNewIncident(parsed);
      }, i * 1500); // Stagger arrival
    });
  };

  // Periodic Refresh for "time ago" counters
  useEffect(() => {
    const timer = setInterval(() => {
        setLastUpdate(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden font-sans">
      {/* Sidebar - Message Simulator */}
      <Sidebar 
        onNewIncident={handleNewIncident} 
        onSimulateDisaster={handleSimulateDisaster}
      />

      {/* Main Map View */}
      <div className="flex-1 relative border-r border-panel-border">
        {/* Top Notification Banner for Escalations */}
        {clusters.some(c => c.severity === 'CRITICAL' && c.status === 'UNASSIGNED') && (
            <div className="absolute top-0 left-0 w-full z-[2000] bg-emergency-critical py-2 text-center text-white text-xs font-black tracking-widest animate-pulse uppercase">
              CRITICAL UNASSIGNED INCIDENTS - IMMEDIATE ACTION REQUIRED
            </div>
        )}
        
        <MapComponent clusters={clusters} />
      </div>

      {/* Dashboard - Incident Command */}
      <Dashboard 
        clusters={clusters} 
        onAssign={handleAssign} 
      />

      {/* Subtle Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </main>
  );
}
