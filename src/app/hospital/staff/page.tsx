'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Package, UserCheck, RefreshCw, LayoutGrid, List, Plus } from 'lucide-react';
import { getHospitals, Hospital, Bed, addBed } from '@/utils/hospital-service';
import { io } from 'socket.io-client';

const socket = io();

export default function StaffPortal() {
  const [hospitals, setHospitals] = useState<Hospital[]>(getHospitals());
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(hospitals[0].id);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId)!;

  const handleBedUpdate = (bedId: string, currentStatus: Bed['status']) => {
    const nextStatus: Bed['status'] = currentStatus === 'Available' ? 'Occupied' : 'Available';
    
    // Optimistic Update
    setHospitals(prev => prev.map(h => {
        if (h.id === selectedHospitalId) {
            return {
                ...h,
                beds: h.beds.map(b => b.id === bedId ? { ...b, status: nextStatus } : b)
            };
        }
        return h;
    }));

    socket.emit('hospital_bed_update', {
        hospitalId: selectedHospitalId,
        bedId,
        status: nextStatus
    });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white font-sans p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Institutional Command</h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{selectedHospital.name}</p>
          </div>
        </div>

        <div className="flex gap-4">
            <select 
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-emerald-500 transition-colors"
            >
                {hospitals.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                ))}
            </select>
            <button className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <RefreshCw className="w-4 h-4" />
                Refresh State
            </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-8">
        {/* Left Sidebar - Quick Stats */}
        <div className="col-span-3 space-y-6">
            <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 backdrop-blur-md">
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <LayoutGrid className="w-3 h-3" />
                    Beds Overview
                </h3>
                <div className="space-y-4">
                    {[
                        { label: 'Total Capacity', val: selectedHospital.beds.length },
                        { label: 'Available Now', val: selectedHospital.beds.filter(b => b.status === 'Available').length },
                        { label: 'ICU Free', val: selectedHospital.beds.filter(b => b.type === 'ICU' && b.status === 'Available').length },
                    ].map((s, i) => (
                        <div key={i} className="flex justify-between items-end border-b border-white/5 pb-2">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase">{s.label}</span>
                            <span className="text-xl font-black italic">{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-zinc-900/50 rounded-3xl border border-white/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Package className="w-12 h-12" />
                </div>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Inventory Alerts</h3>
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-[10px] font-black text-red-500 uppercase italic">Low Supplies</p>
                    <p className="text-[9px] text-zinc-400 mt-1">Oxygen Tanks (Level: 14%)</p>
                </div>
            </div>

            {/* NEW: Add Bed Form */}
            <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/20">
                <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Plus className="w-3 h-3" />
                    Expand Capacity
                </h3>
                <div className="space-y-4">
                    <select className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-[10px] font-bold text-white uppercase outline-none">
                        <option>ICU Bed</option>
                        <option>General Bed</option>
                        <option>Ventilator</option>
                    </select>
                    <button 
                        onClick={() => {
                            addBed(selectedHospitalId, { type: 'ICU', status: 'Available' });
                            setHospitals(getHospitals());
                            socket.emit('new_bed_added', { hospitalId: selectedHospitalId });
                        }}
                        className="w-full py-2 bg-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
                    >
                        Add New Unit
                    </button>
                </div>
            </div>
        </div>

        {/* Main Section - Bed Management Grid */}
        <div className="col-span-9">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-black text-white uppercase italic tracking-widest flex items-center gap-2">
                    <List className="w-4 h-4 text-emerald-500" />
                    Unit Management Grid
                </h2>
                <div className="flex gap-2">
                    {['ALL', 'ICU', 'GENERAL'].map(filter => (
                        <button key={filter} className="px-3 py-1 bg-zinc-800 text-[8px] font-black rounded-full text-zinc-400 hover:text-white transition-colors uppercase">
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <AnimatePresence>
                    {selectedHospital.beds.map((bed) => (
                        <motion.div
                            key={bed.id}
                            layout
                            className={`p-6 rounded-3xl border transition-all duration-300 ${
                                bed.status === 'Available' 
                                ? 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700' 
                                : 'bg-emerald-500/5 border-emerald-500/30'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Unit ID</span>
                                    <span className="text-lg font-black text-white italic uppercase">{bed.id}</span>
                                </div>
                                <div className={`px-2 py-1 rounded text-[8px] font-black uppercase ${
                                    bed.type === 'ICU' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                    {bed.type}
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-8">
                                <div className="flex flex-col">
                                    <span className="text-[8px] text-zinc-500 font-bold uppercase mb-1">Status</span>
                                    <span className={`text-[11px] font-black tracking-widest uppercase ${
                                        bed.status === 'Available' ? 'text-zinc-500' : 'text-emerald-500'
                                    }`}>
                                        {bed.status}
                                    </span>
                                </div>
                                
                                <button
                                    onClick={() => handleBedUpdate(bed.id, bed.status)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-tighter transition-all transform active:scale-95 ${
                                        bed.status === 'Available'
                                        ? 'bg-white text-black hover:bg-emerald-500 hover:text-white'
                                        : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                    }`}
                                >
                                    {bed.status === 'Available' ? 'Allot Bed' : 'Discharge'}
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
      </div>
    </main>
  );
}
