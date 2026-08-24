import React, { useState } from 'react';
import axios from 'axios';
import { Cpu, Play, CheckCircle2, AlertCircle, BarChart2, Layers, Loader2 } from 'lucide-react';

export default function OptimizationView() {
  const [budgetLimit, setBudgetLimit] = useState(100000000);
  const [maxSections, setMaxSections] = useState(6);
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState(null);

  const handleSolve = async () => {
    setIsSolving(true);
    setSolution(null);
    try {
      const res = await axios.post('/api/optimize', {
        max_budget: Number(budgetLimit),
        max_sections: Number(maxSections)
      });
      setSolution(res.data);
    } catch (err) {
      console.error('Error running optimization model:', err);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">PuLP Linear Optimization Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time Mathematical Optimization Model executing CBC (Coin-OR Branch and Cut) on actual parsed Excel road sections
            </p>
          </div>
        </div>
      </div>

      {/* Inputs and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Optimization Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Budget Constraint Limit (LKR)
            </label>
            <input
              type="number"
              value={budgetLimit}
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Maximum Allowed Sections
            </label>
            <input
              type="number"
              value={maxSections}
              onChange={(e) => setMaxSections(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <button
            onClick={handleSolve}
            disabled={isSolving}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSolving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running PuLP CBC Solver...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Solve LP Model in Python</span>
              </>
            )}
          </button>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Optimal Allocation Results</span>
          </h3>

          {solution ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-bold text-white text-xs">Status: {solution.status}</div>
                    <div className="text-[11px] text-slate-400">{solution.solver}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Total Length Allocated</div>
                  <div className="font-extrabold text-emerald-400 text-sm">{solution.total_length_km} km</div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">Optimally Selected Sections from Excel:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {solution.selected_sections.map((sec, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>{sec.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">{sec.length} km</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 mb-2 stroke-1" />
              <span>Configure budget limit and click "Solve LP Model in Python"</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
