'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { IncidentCluster } from '@/utils/cluster-service';

interface DashboardProps {
  clusters: IncidentCluster[];
  onAssign: (id: string) => void;
}

export default function Dashboard({ clusters, onAssign }: DashboardProps) {
  const sortedClusters = [...clusters].sort((a, b) => {
    const priority = { CRITICAL: 3, HIGH: 2, MEDIUM: 1 };
    return priority[b.severity] - priority[a.severity];
  });

  return (
    <div className="w-[450px] h-full bg-panel-bg border-l border-panel-border glass-morphism flex flex-col">
      <div className="p-6 border-b border-panel-border">
        <h2 className="text-sm font-bold tracking-[0.2em] text-zinc-500 uppercase flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-emergency-high" />
          Active Incident Command
        </h2>
        <div className="mt-1 flex items-center justify-between">
          <div className="text-2xl font-black text-white italic">{clusters.length} INCIDENTS</div>
          <div className="px-2 py-1 bg-zinc-800 rounded text-[10px] font-mono text-zinc-400">
            LOAD: {Math.min(clusters.length * 5, 100)}%
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {sortedClusters.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 text-center p-10">
              <CheckCircle2 className="w-16 h-16 mb-4" />
              <p className="text-sm font-bold">ALL AREAS SECURE</p>
              <p className="text-xs">Monitoring real-time traffic...</p>
            </div>
          ) : (
            sortedClusters.map((cluster) => (
              <motion.div
                key={cluster.id}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-xl border relative overflow-hidden group transition-all duration-300 ${
                  cluster.severity === 'CRITICAL' 
                    ? 'bg-emergency-critical/5 border-emergency-critical/30 hover:border-emergency-critical/60 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                    : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {/* Severity Badge */}
                <div className={`absolute top-0 right-0 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-lg ${
                  cluster.severity === 'CRITICAL' ? 'bg-emergency-critical' : 'bg-zinc-800'
                }`}>
                  {cluster.severity}
                </div>

                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-emergency-high transition-colors tracking-tight">
                      {cluster.locationName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold">
                        <Users className="w-3 h-3" />
                        {cluster.messages.length} REPORTS
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-bold uppercase transition-all">
                        <Clock className="w-3 h-3" />
                        {Math.floor((Date.now() - cluster.lastUpdated) / 1000)}S AGO
                      </div>
                    </div>
                  </div>
                </div>

                {cluster.prediction && (
                  <div className="mb-4 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-[10px] text-yellow-500 font-bold italic animate-pulse">
                    {cluster.prediction}
                  </div>
                )}

                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Status</span>
                    <span className={`text-[11px] font-black tracking-widest uppercase ${
                      cluster.status === 'RESPONDING' ? 'text-green-500' : 'text-zinc-300'
                    }`}>
                      {cluster.status}
                    </span>
                  </div>
                  
                  {cluster.status === 'UNASSIGNED' ? (
                    <button
                      onClick={() => onAssign(cluster.id)}
                      className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-tighter rounded-lg hover:bg-emergency-critical hover:text-white transition-all transform active:scale-95 flex items-center gap-2"
                    >
                      Assign Responder
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      Units En Route
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer Insight */}
      <div className="p-6 bg-black/40 border-t border-panel-border italic text-[11px] text-zinc-500">
        <p>SYSTEM AUTO-TRIAGE LEVEL 4 ACTIVE. All critical events prioritized by message frequency and NLP severity scoring.</p>
      </div>
    </div>
  );
}
