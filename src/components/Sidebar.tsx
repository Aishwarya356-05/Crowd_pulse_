'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smartphone, ShieldAlert, Zap } from 'lucide-react';
import { parseEmergencyMessage, generateAutoResponse } from '@/utils/ai-pipeline';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

interface SidebarProps {
  onNewIncident: (message: any) => void;
  onSimulateDisaster: () => void;
}

export default function Sidebar({ onNewIncident, onSimulateDisaster }: SidebarProps) {
  const [inputText, setInputText] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      text: inputText,
      sender: 'user',
      timestamp: Date.now(),
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAnalyzing(true);

    // Simulate AI Processing Delay
    setTimeout(() => {
      const parsed = parseEmergencyMessage(userMsg.text);
      const aiReply = generateAutoResponse(parsed);

      const aiMsg: Message = {
        id: Math.random().toString(36).substring(7),
        text: aiReply,
        sender: 'ai',
        timestamp: Date.now(),
      };

      setChatHistory((prev) => [...prev, aiMsg]);
      setIsAnalyzing(false);

      // Trigger incident update
      onNewIncident(parsed);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-panel-bg border-r border-panel-border w-96 glass-morphism overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-panel-border bg-gradient-to-b from-panel-bg to-transparent">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-emergency-critical/20 rounded-lg flex items-center justify-center border border-emergency-critical/30">
            <ShieldAlert className="text-emergency-critical w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">CrowdPulse</h1>
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
               SYSTEM ONLINE - REAL-TIME
            </div>
          </div>
        </div>
      </div>

      {/* Message Simulator Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <AnimatePresence initial={false}>
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100 rounded-tr-none'
                    : 'bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 rounded-tl-none'
                }`}
              >
                <div className="text-[10px] opacity-40 mb-1 font-mono uppercase">
                  {msg.sender === 'user' ? 'INCOMING SMS' : 'AI MONITOR'}
                </div>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start items-center gap-2 text-xs text-emergency-high italic"
          >
            <Zap className="w-3 h-3 animate-spin" />
            AI Pipeline analyzing content...
          </motion.div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 bg-panel-accent border-t border-panel-border space-y-4">
        <div className="relative group">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type emergency report..."
            className="w-full bg-black/50 border border-panel-border rounded-xl p-3 pr-12 text-sm focus:outline-none focus:border-emergency-critical/50 transition-all resize-none h-20 placeholder:text-zinc-600"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isAnalyzing}
            className="absolute right-3 bottom-3 p-2 bg-emergency-critical/10 hover:bg-emergency-critical text-emergency-critical hover:text-white rounded-lg transition-all disabled:opacity-30"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onSimulateDisaster}
          className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold tracking-widest text-zinc-400 hover:text-white uppercase transition-all flex items-center justify-center gap-2 group"
        >
          <Zap className="w-4 h-4 group-hover:text-yellow-400 transition-colors" />
          Simulate Disaster Scenario
        </button>
      </div>
    </div>
  );
}
