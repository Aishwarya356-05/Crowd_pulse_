'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Map as MapIcon, Info, Users, AlertTriangle } from 'lucide-react';
import { getHospitals, Hospital, getAmbulances, Ambulance } from '@/utils/hospital-service';
import EmergencyPortal from '@/components/EmergencyPortal';
import { io } from 'socket.io-client';

const HospitalMap = dynamic(() => import('@/components/HospitalMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-800 uppercase tracking-widest font-bold">Initializing Grid...</div>
});

const socket = io();

export default function HospitalPortal() {
  const [hospitals, setHospitals] = useState<Hospital[]>(getHospitals());
  const [ambulances, setAmbulances] = useState<Ambulance[]>(getAmbulances());
  const [activeIncidents, setActiveIncidents] = useState<any[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);

  useEffect(() => {
    socket.on('bed_status_changed', (data) => {
      setHospitals(prev => prev.map(h => {
        if (h.id === data.hospitalId) {
          return {
            ...h,
            beds: h.beds.map(b => b.id === data.bedId ? { ...b, status: data.status } : b)
          };
        }
        return h;
      }));
    });

    socket.on('bed_added_globally', () => {
        setHospitals(getHospitals());
    });

    socket.on('ambulance_location_updated', (data) => {
        setAmbulances(prev => prev.map(a => a.id === data.id ? { ...a, coordinates: data.coordinates } : a));
    });

    socket.on('new_hbmers_incident', (data) => {
        setActiveIncidents(prev => [...prev, data]);
        // Simulate ambulance trip
        setAmbulances(prev => prev.map(a => a.id === 'amb1' ? { ...a, status: 'Responding' } : a));
        
        let step = 0;
        const start = [12.9344, 77.6121]; // St Johns
        const target = [data.location.lat, data.location.lng];
        
        const interval = setInterval(() => {
            step += 0.05;
            if (step >= 1) {
                clearInterval(interval);
                return;
            }
            const lat = start[0] + (target[0] - start[0]) * step;
            const lng = start[1] + (target[1] - start[1]) * step;
            socket.emit('ambulance_telemetry', { id: 'amb1', coordinates: [lat, lng] });
        }, 500);
    });

    return () => {
      socket.off('bed_status_changed');
      socket.off('bed_added_globally');
      socket.off('ambulance_location_updated');
      socket.off('new_hbmers_incident');
    };
  }, []);

  const handleReport = (data: any) => {
    socket.emit('emergency_report_hbmers', data);
  };

  return (
    <main className="flex h-screen w-screen bg-black overflow-hidden font-sans text-white">
      {/* Structural Header */}
      <div className="fixed top-0 left-0 w-full h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl z-[2000] flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emergency-critical rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.3em] uppercase italic leading-none">HBMERS</h1>
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Public Emergency Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter italic">Network Latency: 12ms</span>
            </div>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                Staff Login
            </button>
        </div>
      </div>

      <div className="flex w-full h-full pt-16">
        {/* Left Section - Controls & Emergency */}
        <div className="w-[450px] p-8 overflow-y-auto custom-scrollbar border-r border-white/5 flex flex-col gap-8 bg-zinc-950/20">
          <EmergencyPortal 
            hospitals={hospitals} 
            onReportIncident={handleReport} 
          />

          <div className="space-y-4">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-500 uppercase flex items-center gap-2">
                <Info className="w-3 h-3" />
                System Analytics
            </h3>
            <div className="grid grid-cols-2 gap-4">
                {[
                    { label: 'Total Beds', val: '4,281', color: 'text-white' },
                    { label: 'ICUs Free', val: '12', color: 'text-emergency-high' },
                    { label: 'Wait Time', val: '14m', color: 'text-zinc-500' },
                    { label: 'Responders', val: '84', color: 'text-emerald-500' },
                ].map((stat, i) => (
                    <div key={i} className="p-4 bg-zinc-900/40 rounded-xl border border-white/5">
                        <span className="text-[9px] font-black text-zinc-600 uppercase block mb-1">{stat.label}</span>
                        <span className={`text-xl font-black italic shadow-text ${stat.color}`}>{stat.val}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        {/* Right Section - Global Grid Map */}
        <div className="flex-1 relative p-8">
            <div className="absolute top-12 left-12 z-[1000] pointer-events-none">
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-2xl">
                    <MapIcon className="w-5 h-5 text-emerald-500" />
                    <div>
                        <p className="text-[10px] font-black text-white uppercase italic tracking-tighter">BENGALURU GRID</p>
                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">REAL-TIME TELEMETRY ACTIVE</p>
                    </div>
                </div>
            </div>

            <HospitalMap 
               hospitals={hospitals} 
               selectedHospitalId={selectedHospitalId}
               ambulances={ambulances}
               activeIncidents={activeIncidents}
            />
            
            {/* Dynamic Hospital List Cards */}
            <div className="absolute bottom-12 left-12 right-12 flex gap-4 overflow-x-auto pb-4 custom-scrollbar-h z-[1000]">
                {hospitals.map((h) => (
                    <motion.div
                        key={h.id}
                        whileHover={{ y: -5 }}
                        onClick={() => setSelectedHospitalId(h.id)}
                        className={`flex-shrink-0 w-72 bg-black/80 backdrop-blur-md p-6 rounded-2xl border transition-all cursor-pointer ${
                            selectedHospitalId === h.id ? 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-white/10'
                        }`}
                    >
                        <h4 className="font-black text-sm uppercase italic text-white mb-2">{h.name}</h4>
                        <div className="flex justify-between items-end">
                            <div>
                                <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">Available Beds</span>
                                <span className="text-2xl font-black italic text-emerald-500">
                                    {h.beds.filter(b => b.status === 'Available').length}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[9px] font-black text-zinc-500 uppercase block mb-1">ICU Ready</span>
                                <span className="text-sm font-black italic text-white">
                                    {h.beds.filter(b => b.type === 'ICU' && b.status === 'Available').length > 0 ? 'YES' : 'MAX'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
      </div>

      {/* Global Aesthetics Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[9999] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]"></div>
    </main>
  );
}
