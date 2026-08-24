import React, { useRef } from 'react';
import axios from 'axios';
import { 
  Building2, 
  FileSpreadsheet, 
  Layers, 
  Calculator, 
  ShieldAlert, 
  Cpu, 
  CheckCircle2, 
  UserCircle,
  FileText,
  Upload,
  FileEdit
} from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  const fileInputRef = useRef(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layers },
    { id: 'details', label: 'Detail Sheets Builder', icon: FileEdit },
    { id: 'estimates', label: 'Road Estimates', icon: FileSpreadsheet },
    { id: 'sections', label: 'Section Builder', icon: Calculator },
    { id: 'landslide', label: 'Landslide Mitigation', icon: ShieldAlert },
    { id: 'hsr-rates', label: 'HSR & SSR Rates', icon: Building2 },
    { id: 'optimization', label: 'PuLP Cost Optimizer', icon: Cpu },
    { id: 'reports', label: 'ReportLab PDF Export', icon: FileText }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`Successfully imported ${file.name}! Reloading data...`);
      window.location.reload();
    } catch (err) {
      alert('Error uploading Excel file. Please ensure it is a valid .xlsx or .xlsm file.');
      console.error(err);
    }
  };

  return (
    <header className="w-full glass-panel sticky top-0 z-50 border-b border-slate-800/80">
      {/* Top Banner / Agency Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/60 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              GOVERNMENT OF SRI LANKA
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">Ministry of Transport & Highways</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Real Excel Engine Sync Active (Zero Dummy Data)</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <UserCircle className="w-4 h-4 text-slate-300" />
              <span className="text-slate-200 font-medium">Senior Engineer (RDA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand & Title Header */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Logo & RDA Heading */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 p-0.5 glow-gold shadow-lg flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group">
                <Building2 className="w-7 h-7 text-amber-400 transform group-hover:scale-110 transition-transform" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white m-0">
                  Road Development Authority
                </h1>
                <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm">
                  RDA
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5 flex items-center gap-2">
                <span>Estimate Automation & Comprehensive BOQ Section Builder</span>
              </p>
            </div>
          </div>

          {/* Excel File Upload & Search */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xlsm"
              className="hidden"
            />
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel File</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="mt-5 pt-3 border-t border-slate-800/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
