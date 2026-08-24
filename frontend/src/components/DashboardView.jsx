import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Building2, 
  FileSpreadsheet, 
  ShieldAlert, 
  ArrowRight,
  Database,
  Cpu,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';

export default function DashboardView({ setActiveTab }) {
  const [loading, setLoading] = useState(true);
  const [workbookInfo, setWorkbookInfo] = useState(null);
  const [roadEstimates, setRoadEstimates] = useState([]);
  const [hsrCount, setHsrCount] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [wbRes, roadRes, hsrRes] = await Promise.all([
        axios.get('/api/workbook/info'),
        axios.get('/api/road-estimates'),
        axios.get('/api/hsr-rates')
      ]);

      setWorkbookInfo(wbRes.data);
      setRoadEstimates(roadRes.data.sections || []);
      setHsrCount(hsrRes.data.total_rates || 0);
    } catch (err) {
      console.error('Error fetching dashboard data from Excel engine:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Loading Excel Engine Data from Workspace...</span>
      </div>
    );
  }

  const roadCount = workbookInfo?.categorized?.road_estimates?.length || 0;
  const landslideCount = workbookInfo?.categorized?.landslide_estimates?.length || 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 mb-3">
              <Building2 className="w-3.5 h-3.5" />
              <span>ROAD DEVELOPMENT AUTHORITY (RDA) • SRI LANKA</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Estimate Automation & Section Builder Portal
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Active Workbook: <span className="text-amber-400 font-mono font-bold">{workbookInfo?.file_name}</span> ({workbookInfo?.total_sheets} Sheets Parsed)
            </p>
          </div>

          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" />
            <span>Reload Excel File</span>
          </button>
        </div>
      </div>

      {/* KPI Cards based on REAL parsed Excel file */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Excel Sheets</span>
            <FileSpreadsheet className="w-5 h-5 text-amber-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{workbookInfo?.total_sheets || 0} Sheets</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Parsed via openpyxl backend</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-blue-500/30 bg-blue-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Road Estimate Sections</span>
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{roadCount} Sections</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Road Estimate 1 to {roadCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Landslide Mitigation</span>
            <ShieldAlert className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{landslideCount} Sub-sites</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Land Est 1 to {landslideCount}</div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-purple-500/30 bg-purple-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">HSR & SSR Rate Schedule</span>
            <Database className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-white">{hsrCount} Standard Items</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Parsed from HSR Rates sheet</div>
          </div>
        </div>
      </div>

      {/* Real Sections Table from Excel */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>Parsed Road Estimate Sections (Live Excel Data)</span>
            </h3>
            <p className="text-xs text-slate-400">Directly loaded from {workbookInfo?.file_name}</p>
          </div>
          <button 
            onClick={() => setActiveTab('estimates')}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View Full BOQ Line Items</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Section Name in Excel</th>
                <th className="py-3 px-4 text-center">Extracted BOQ Items</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {roadEstimates.map((sec, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-amber-400">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-white">{sec.section_name}</td>
                  <td className="py-3 px-4 text-center font-mono text-slate-300">{sec.total_items} items</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Parsed from Excel
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
