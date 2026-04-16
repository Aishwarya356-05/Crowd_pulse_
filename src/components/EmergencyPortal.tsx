'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MapPin, Search, PhoneCall, ChevronRight } from 'lucide-react';
import { Hospital, getNearestAvailableBed } from '@/utils/hospital-service';

interface EmergencyPortalProps {
  onReportIncident: (data: any) => void;
  hospitals: Hospital[];
}

export default function EmergencyPortal({ onReportIncident, hospitals }: EmergencyPortalProps) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState('ACCIDENT');
  const [nearestHospital, setNearestHospital] = useState<Hospital | null>(null);

  const handleReport = () => {
    // Mock geolocation: Koramangala area
    const location = { lat: 12.93, lng: 77.61 };
    const nearest = getNearestAvailableBed(location.lat, location.lng, 'ICU');
    setNearestHospital(nearest || null);
    
    onReportIncident({
      type: reportType,
      location,
      timestamp: Date.now(),
      severity: 'CRITICAL'
    });
    
    setIsReporting(true);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {!isReporting ? (
        <div className="space-y-6">
          <div className="bg-zinc-950/50 p-6 rounded-2xl border border-zinc-800 backdrop-blur-sm">
            <h2 className="text-xs font-black tracking-[0.3em] text-zinc-500 uppercase mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emergency-critical" />
              Emergency Dashboard
            </h2>
            <p className="text-2xl font-black text-white italic mb-6">REPORT INCIDENT</p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {['ACCIDENT', 'CARDIAC', 'FIRE', 'TRAUMA'].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                    reportType === type 
                      ? 'bg-emergency-critical text-white shadow-[0_0_20px_rgba(239,68,68,0.3)]' 
                      : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button
              onClick={handleReport}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-emergency-critical hover:text-white transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-xl"
            >
              One-Tap Report
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800/50 dash-border">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-600 uppercase mb-3">Check Availability</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <input 
                type="text" 
                placeholder="Search specialty (e.g. ICU, Bed)..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg py-3 pl-10 pr-4 text-[11px] text-white focus:outline-none focus:border-zinc-700 transition-colors"
              />
            </div>
          </div>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emergency-critical/10 p-8 rounded-3xl border-2 border-emergency-critical shadow-[0_0_50px_rgba(239,68,68,0.2)] text-center"
        >
          <div className="w-20 h-20 bg-emergency-critical rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_#ef4444]">
            <PhoneCall className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-white italic mb-2 uppercase tracking-tighter">Emergency Reported</h2>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-8">Authorities notified • GPS active</p>

          {nearestHospital && (
            <div className="bg-black/60 p-6 rounded-2xl border border-white/10 text-left mb-6">
              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Recommended Facility</span>
              <h3 className="text-lg font-black text-white uppercase italic leading-tight mb-2">{nearestHospital.name}</h3>
              <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold">
                <MapPin className="w-3 h-3" />
                {nearestHospital.address}
              </div>
              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] font-black text-white bg-emerald-500/20 px-3 py-1 rounded">FASTEST RESPONSE</span>
                <span className="text-emerald-500 font-mono font-bold">1.2 KM</span>
              </div>
            </div>
          )}

          <button 
            onClick={() => setIsReporting(false)}
            className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      )}
    </div>
  );
}
