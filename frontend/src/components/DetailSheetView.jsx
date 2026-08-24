import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Plus, 
  Save, 
  RefreshCw, 
  MapPin, 
  Truck, 
  Layers, 
  Calculator, 
  CheckCircle2,
  Loader2,
  Building2,
  FileText
} from 'lucide-react';

export default function DetailSheetView() {
  const [detailSheets, setDetailSheets] = useState([
    'Detail -1', 'Detail -2', 'Detail -3', 'Detail -4', 'Detail -5',
    'Detail -6', 'Detail -7', 'Detail -8', 'Detail -9', 'Detail -10', 'Detail -11'
  ]);
  const [selectedSheet, setSelectedSheet] = useState('Detail -1');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Detail Sheet Form State
  const [newSheetName, setNewSheetName] = useState('Detail -12');
  const [newProvince, setNewProvince] = useState('Central');
  const [newDistrict, setNewDistrict] = useState('Kandy');
  const [newRoadName, setNewRoadName] = useState('Kandy-Badulla Road Section');

  useEffect(() => {
    fetchDetailSheet(selectedSheet);
  }, [selectedSheet]);

  const fetchDetailSheet = async (sheetName) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/detail-sheet/${sheetName}`);
      setSheetData(res.data);
    } catch (err) {
      console.error(`Error fetching detail sheet ${sheetName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewSheet = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/detail-sheet/create', {
        sheet_name: newSheetName,
        province: newProvince,
        district: newDistrict,
        road_name: newRoadName,
        contract_no: 'RDA/DC/DRP/SLOPE/CP/KDY/KDY/PACKAGE 17A'
      });

      if (!detailSheets.includes(newSheetName)) {
        setDetailSheets([...detailSheets, newSheetName]);
      }
      setSelectedSheet(newSheetName);
      setShowCreateModal(false);
      alert(`Detail Sheet '${newSheetName}' created with full RDA structure!`);
    } catch (err) {
      console.error('Error creating detail sheet:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Loading Full Detail Sheet Structure from Excel Engine...</span>
      </div>
    );
  }

  const meta = sheetData?.metadata || {};
  const distances = sheetData?.transport_distances || [];
  const surfaces = sheetData?.surfaces || [];
  const items = sheetData?.items || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Detail Sheet Selector */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">RDA Detail Sheets (Road Data & Quantity Builder)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive Road Measurement Data Sheet, Material Distances & SSCM Pay Item Quantities
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Create Detail Sheet</span>
            </button>

            <button 
              onClick={() => fetchDetailSheet(selectedSheet)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
              <span>Refresh Structure</span>
            </button>
          </div>
        </div>

        {/* Detail Sheet Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {detailSheets.map((sName) => (
            <button
              key={sName}
              onClick={() => setSelectedSheet(sName)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSheet === sName
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sName}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: FULL ROAD DATA SHEET METADATA HEADER */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>Section 1: General Road Project Data Sheet ({selectedSheet})</span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            DATA SHEET TEMPLATE REV0
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Project Title</label>
            <input 
              type="text" 
              readOnly 
              value={meta.project_title} 
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Contract Serial No.</label>
            <input 
              type="text" 
              readOnly 
              value={meta.contract_no} 
              className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 font-mono font-medium focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Province</label>
            <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500">
              <option value="Central">Central</option>
              <option value="Western">Western</option>
              <option value="Southern">Southern</option>
              <option value="Sabaragamuwa">Sabaragamuwa</option>
              <option value="North Western">North Western</option>
              <option value="Northern">Northern</option>
              <option value="North Central">North Central</option>
              <option value="Eastern">Eastern</option>
              <option value="Uva">Uva</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">District</label>
            <select className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500">
              <option value="Kandy">Kandy</option>
              <option value="Matale">Matale</option>
              <option value="Nuwara Eliya">Nuwara Eliya</option>
              <option value="Colombo">Colombo</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kalutara">Kalutara</option>
              <option value="Galle">Galle</option>
              <option value="Matara">Matara</option>

            </select>
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">EE Division</label>
            <input type="text" defaultValue={meta.ee_division} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">CE Division</label>
            <input type="text" defaultValue={meta.ce_division} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200" />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Road Length (km)</label>
            <input type="text" defaultValue={meta.road_length_km} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono" />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-semibold">Proposed Road Width (m)</label>
            <input type="text" defaultValue={meta.proposed_width_m} className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 font-mono" />
          </div>
        </div>
      </div>

      {/* SECTION 2: MATERIAL TRANSPORT DISTANCES (SAMPLE TRANSPORT DISTANCES) */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-slate-800 pb-3">
          <Truck className="w-4 h-4" />
          <span>Section 2: Material Transport Distances (Lead Distances for Estimator)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {distances.map((dist, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200">{dist.material}</div>
                <div className="text-[11px] text-slate-400">Haulage lead distance</div>
              </div>
              <div className="flex items-center gap-1.5">
                <input 
                  type="number" 
                  defaultValue={dist.distance_km} 
                  className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded text-right font-mono font-bold text-amber-400 text-xs"
                />
                <span className="text-slate-400 font-semibold">{dist.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: EXISTING ROAD SURFACE CLASSIFICATION */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-3">
          <Layers className="w-4 h-4" />
          <span>Section 3: Existing Road Surface Classification & Surface Areas</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Surface Classification</th>
                <th className="py-3 px-4 text-right">Length (m)</th>
                <th className="py-3 px-4 text-right">Avg Existing Width (m)</th>
                <th className="py-3 px-4 text-right">Proposed Width (m)</th>
                <th className="py-3 px-4 text-right">Calculated Area (Sq.m)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono">
              {surfaces.map((surf, i) => (
                <tr key={i} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-sans font-medium text-slate-100">{surf.type}</td>
                  <td className="py-3 px-4 text-right text-slate-300">{surf.length_m} m</td>
                  <td className="py-3 px-4 text-right text-slate-300">{surf.avg_width_m} m</td>
                  <td className="py-3 px-4 text-right text-slate-300">{surf.proposed_width_m} m</td>
                  <td className="py-3 px-4 text-right font-bold text-emerald-400">{surf.area_sqm.toLocaleString()} Sq.m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: ITEMIZED SSCM MEASUREMENT & QUANTITY CALCULATION SHEET */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>Section 4: Itemized SSCM Measurement & Quantity Calculation Sheet</span>
          </div>
          <span className="text-xs text-slate-400">Total Extracted SSCM Items: <span className="text-amber-400 font-bold">{items.length}</span></span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-16">Item No</th>
                <th className="py-3 px-6">SSCM Description of Work</th>
                <th className="py-3 px-3 text-center">Unit</th>
                <th className="py-3 px-4 text-right">LHS Qty</th>
                <th className="py-3 px-4 text-right">RHS Qty</th>
                <th className="py-3 px-4 text-right">Total Calculated Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {items.map((it, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-amber-400">{it.item_no}</td>
                  <td className="py-3 px-6 font-medium text-slate-100">{it.description}</td>
                  <td className="py-3 px-3 text-center text-slate-400">{it.unit}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">0.0</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">0.0</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">0.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW DETAIL SHEET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl p-6 border border-slate-700 max-w-md w-full space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                <span>Create New Detail Sheet Structure</span>
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewSheet} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detail Sheet Name</label>
                <input 
                  type="text" 
                  required 
                  value={newSheetName} 
                  onChange={(e) => setNewSheetName(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  placeholder="Detail -12"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Province</label>
                <select 
                  value={newProvince} 
                  onChange={(e) => setNewProvince(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Central">Central</option>
                  <option value="Western">Western</option>
                  <option value="Southern">Southern</option>
                  <option value="Northern">Northern</option>
                  <option value="Sabaragamuwa">Sabaragamuwa</option>
                  <option value="Uva">Uva</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">District</label>
                <input 
                  type="text" 
                  required 
                  value={newDistrict} 
                  onChange={(e) => setNewDistrict(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Road Name</label>
                <input 
                  type="text" 
                  required 
                  value={newRoadName} 
                  onChange={(e) => setNewRoadName(e.target.value)} 
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Detail Sheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
