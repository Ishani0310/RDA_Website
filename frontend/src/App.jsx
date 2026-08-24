import React, { useState } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import EstimateBuilderView from './components/EstimateBuilderView';
import OptimizationView from './components/OptimizationView';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Navigation & Header with "Road Development Authority" Heading */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
        {activeTab === 'estimates' && <EstimateBuilderView />}
        {activeTab === 'sections' && <EstimateBuilderView />}
        {activeTab === 'optimization' && <OptimizationView />}
        {activeTab === 'landslide' && (
          <div className="glass-card rounded-2xl p-10 text-center border border-slate-800/80 space-y-4 max-w-3xl mx-auto my-8">
            <h2 className="text-2xl font-bold gradient-text-white">Landslide Mitigation BOQ Module</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Slope stabilization, soil nailing, anchor bolt installation and retaining structure estimates for high-risk disaster zones.
            </p>
          </div>
        )}
        {activeTab === 'hsr-rates' && (
          <div className="glass-card rounded-2xl p-10 text-center border border-slate-800/80 space-y-4 max-w-3xl mx-auto my-8">
            <h2 className="text-2xl font-bold gradient-text-white">Highways Schedule of Rates (HSR 2026)</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Standardized unit rates for labor, machinery, fuel, and materials as published by Road Development Authority (RDA) Sri Lanka.
            </p>
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="glass-card rounded-2xl p-10 text-center border border-slate-800/80 space-y-4 max-w-3xl mx-auto my-8">
            <h2 className="text-2xl font-bold gradient-text-white">ReportLab Automated PDF Generator</h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              Generate official RDA project estimate documents, BOQ summaries, and executive approval certificates.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 bg-slate-950/90 backdrop-blur-md py-6 px-6 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Road Development Authority (RDA)</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">Estimate Automation System</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">React 18</span>
            <span className="text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">FastAPI</span>
            <span className="text-slate-700">•</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
