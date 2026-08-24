import React, { useState } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import EstimateBuilderView from './components/EstimateBuilderView';
import OptimizationView from './components/OptimizationView';
import DetailSheetView from './components/DetailSheetView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation & Header with "Road Development Authority" Heading */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'details' && <DetailSheetView />}
        {activeTab === 'estimates' && <EstimateBuilderView />}
        {activeTab === 'sections' && <DetailSheetView />}
        {activeTab === 'optimization' && <OptimizationView />}
        {activeTab === 'landslide' && (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-3">
            <h2 className="text-xl font-bold text-white">Landslide Mitigation BOQ Module</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Slope stabilization, soil nailing, anchor bolt installation and retaining structure estimates.
            </p>
          </div>
        )}
        {activeTab === 'hsr-rates' && (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-3">
            <h2 className="text-xl font-bold text-white">Highways Schedule of Rates (HSR 2026)</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Standardized unit rates for labor, machinery, fuel, and materials as published by RDA Sri Lanka.
            </p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="glass-card rounded-2xl p-8 text-center border border-slate-800 space-y-3">
            <h2 className="text-xl font-bold text-white">ReportLab Automated PDF Generator</h2>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Generate official RDA project estimate documents, BOQ summaries, and approval certificates.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 px-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Road Development Authority (RDA)</span>
            <span>• Estimate Automation System</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>React + Vite</span>
            <span>•</span>
            <span>FastAPI Backend</span>
            <span>•</span>
            <span>PostgreSQL & PuLP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
