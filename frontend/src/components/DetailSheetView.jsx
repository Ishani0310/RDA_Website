import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Plus, 
  Save, 
  RefreshCw, 
  Truck, 
  Layers, 
  Calculator, 
  Building2,
  FileText,
  Loader2,
  Eye,
  SlidersHorizontal,
  Download,
  CheckCircle2
} from 'lucide-react';

export default function DetailSheetView() {
  const [detailSheets, setDetailSheets] = useState(['Detail -1']);
  const [selectedSheet, setSelectedSheet] = useState('Detail -1');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // New Detail Sheet Form State
  const [newSheetName, setNewSheetName] = useState('Detail -2');
  const [newProvince, setNewProvince] = useState('Central');
  const [newDistrict, setNewDistrict] = useState('Kandy');
  const [newRoadName, setNewRoadName] = useState('New Road Rehabilitation Section');

  // Interactive LHS/RHS Measurement Input State
  const [itemMeasurements, setItemMeasurements] = useState({});

  // Optional Surface Section Toggles (User can choose which surface sections to show for easy value entry)
  const [visibleSections, setVisibleSections] = useState({
    gravel: true,
    asphalt: true,
    concrete: true,
    interlock: true
  });

  useEffect(() => {
    fetchDetailSheet(selectedSheet);
  }, [selectedSheet]);

  const openCreateModal = () => {
    const nextNum = detailSheets.length + 1;
    setNewSheetName(`Detail -${nextNum}`);
    setShowCreateModal(true);
  };

  const fetchDetailSheet = async (sheetName) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/detail-sheet/${sheetName}`);
      setSheetData(res.data);
      
      const initialMap = {};
      (res.data.items || []).forEach(it => {
        if (!it.is_header) {
          initialMap[it.item_no + '_' + it.description] = {
            gravel_lhs: 0, gravel_rhs: 0,
            asphalt_lhs: 0, asphalt_rhs: 0,
            concrete_lhs: 0, concrete_rhs: 0,
            interlock_lhs: 0, interlock_rhs: 0
          };
        }
      });
      setItemMeasurements(initialMap);
    } catch (err) {
      console.error(`Error fetching detail sheet ${sheetName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (itemKey, field, value) => {
    const numVal = parseFloat(value) || 0;
    setItemMeasurements(prev => ({
      ...prev,
      [itemKey]: {
        ...(prev[itemKey] || {}),
        [field]: numVal
      }
    }));
  };

  const toggleSection = (sectionKey) => {
    setVisibleSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const selectSingleSection = (sectionKey) => {
    setVisibleSections({
      gravel: sectionKey === 'gravel',
      asphalt: sectionKey === 'asphalt',
      concrete: sectionKey === 'concrete',
      interlock: sectionKey === 'interlock'
    });
  };

  const showAllSections = () => {
    setVisibleSections({
      gravel: true,
      asphalt: true,
      concrete: true,
      interlock: true
    });
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
    } catch (err) {
      console.error('Error creating detail sheet:', err);
    } finally {
      setSaving(false);
    }
  };

  // SUBMIT & EXPORT TO EXCEL FUNCTION
  const handleExportToExcel = async () => {
    setExporting(true);
    setExportSuccess(false);
    try {
      const itemsPayload = (sheetData?.items || []).map(it => {
        if (it.is_header) {
          return {
            item_no: it.item_no,
            description: it.description,
            unit: '',
            is_header: true
          };
        }
        const itemKey = it.item_no + '_' + it.description;
        const m = itemMeasurements[itemKey] || {};
        return {
          item_no: it.item_no,
          description: it.description,
          unit: it.unit,
          is_header: false,
          gravel_lhs: m.gravel_lhs || 0,
          gravel_rhs: m.gravel_rhs || 0,
          asphalt_lhs: m.asphalt_lhs || 0,
          asphalt_rhs: m.asphalt_rhs || 0,
          concrete_lhs: m.concrete_lhs || 0,
          concrete_rhs: m.concrete_rhs || 0,
          interlock_lhs: m.interlock_lhs || 0,
          interlock_rhs: m.interlock_rhs || 0
        };
      });

      const response = await axios.post('/api/detail-sheet/export', {
        sheet_name: selectedSheet,
        metadata: sheetData?.metadata || {},
        transport_distances: sheetData?.transport_distances || [],
        items: itemsPayload
      }, {
        responseType: 'blob'
      });

      // Create download link for generated Excel sheet
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `RDA_Detail_Sheet_${selectedSheet.replace(/\s+/g, '_')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err) {
      console.error('Error exporting detail sheet to Excel:', err);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Loading Detail Sheet Structure from Excel Engine...</span>
      </div>
    );
  }

  const meta = sheetData?.metadata || {};
  const distances = sheetData?.transport_distances || [];
  const surfaces = sheetData?.surfaces || [];
  const items = sheetData?.items || [];

  const activeColCount = 3 + 
    (visibleSections.gravel ? 2 : 0) + 
    (visibleSections.asphalt ? 2 : 0) + 
    (visibleSections.concrete ? 2 : 0) + 
    (visibleSections.interlock ? 2 : 0) + 1;

  return (
    <div className="space-y-6">
      {/* Header & Detail Sheet Selector */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">RDA Detail Sheets (Road Data & Quantity Builder)</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive Road Measurement Data Sheet with Category Headers & Excel Export Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SUBMIT & EXPORT TO EXCEL BUTTON */}
            <button 
              onClick={handleExportToExcel}
              disabled={exporting}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Generating Excel...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-slate-950" />
                  <span>Excel Exported!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Submit & Export to Excel (.xlsx)</span>
                </>
              )}
            </button>

            <button 
              onClick={openCreateModal}
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

      {/* SECTION 1: GENERAL ROAD PROJECT DATA SHEET METADATA HEADER */}
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

      {/* SECTION 2: MATERIAL TRANSPORT DISTANCES */}
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

      {/* SECTION 3: OPTIONAL SURFACE SECTIONS TOGGLE & ENTRY MATRIX */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Section 3: SSCM Measurement Matrix (Selectable Surface Sections & Excel Export Engine)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Enter values below, then click <span className="text-emerald-400 font-bold">"Submit & Export to Excel"</span> to download your completed Excel sheet
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={showAllSections}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Show All 4 Sections</span>
            </button>
          </div>
        </div>

        {/* OPTIONAL SURFACE SECTION SELECTION TOGGLE PILLS */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Visible Surface Sections:</span>
          </span>

          <button
            onClick={() => toggleSection('gravel')}
            onDoubleClick={() => selectSingleSection('gravel')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              visibleSections.gravel
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${visibleSections.gravel ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
            <span>1. Gravel Section</span>
          </button>

          <button
            onClick={() => toggleSection('asphalt')}
            onDoubleClick={() => selectSingleSection('asphalt')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              visibleSections.asphalt
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${visibleSections.asphalt ? 'bg-blue-400' : 'bg-slate-600'}`}></span>
            <span>2. AC / Macadam / Tar</span>
          </button>

          <button
            onClick={() => toggleSection('concrete')}
            onDoubleClick={() => selectSingleSection('concrete')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              visibleSections.concrete
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${visibleSections.concrete ? 'bg-purple-400' : 'bg-slate-600'}`}></span>
            <span>3. Concrete Surface</span>
          </button>

          <button
            onClick={() => toggleSection('interlock')}
            onDoubleClick={() => selectSingleSection('interlock')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              visibleSections.interlock
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${visibleSections.interlock ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            <span>4. Interlock Paved</span>
          </button>
        </div>

        {/* DYNAMIC OPTIONAL SURFACE SECTIONS TABLE MATRIX */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-[11px] text-slate-300">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th colSpan={3} className="py-3 px-3 border-r border-slate-800 bg-slate-950 text-amber-400 font-extrabold text-xs">
                  SSCM Item & Description
                </th>
                
                {visibleSections.gravel && (
                  <th colSpan={2} className="py-2.5 px-2 text-center border-r border-slate-800 bg-amber-500/10 text-amber-400 border-t-2 border-t-amber-500">
                    1. Gravel Section
                  </th>
                )}

                {visibleSections.asphalt && (
                  <th colSpan={2} className="py-2.5 px-2 text-center border-r border-slate-800 bg-blue-500/10 text-blue-400 border-t-2 border-t-blue-500">
                    2. AC, Macadam, Tar Surface
                  </th>
                )}

                {visibleSections.concrete && (
                  <th colSpan={2} className="py-2.5 px-2 text-center border-r border-slate-800 bg-purple-500/10 text-purple-400 border-t-2 border-t-purple-500">
                    3. Concrete Surface Section
                  </th>
                )}

                {visibleSections.interlock && (
                  <th colSpan={2} className="py-2.5 px-2 text-center border-r border-slate-800 bg-emerald-500/10 text-emerald-400 border-t-2 border-t-emerald-500">
                    4. Interlock Paved Section
                  </th>
                )}

                <th className="py-2.5 px-3 text-right bg-slate-950 text-amber-400 border-t-2 border-t-amber-400 font-extrabold text-xs">
                  Total (Qty / m)
                </th>
              </tr>

              <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[9px]">
                <th className="py-2 px-2 w-12 border-r border-slate-800">Item</th>
                <th className="py-2 px-3 border-r border-slate-800">Description of Work</th>
                <th className="py-2 px-2 text-center border-r border-slate-800">Unit</th>

                {visibleSections.gravel && (
                  <>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800/60 bg-amber-500/5">LHS</th>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800 bg-amber-500/5">RHS</th>
                  </>
                )}

                {visibleSections.asphalt && (
                  <>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800/60 bg-blue-500/5">LHS</th>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800 bg-blue-500/5">RHS</th>
                  </>
                )}

                {visibleSections.concrete && (
                  <>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800/60 bg-purple-500/5">LHS</th>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800 bg-purple-500/5">RHS</th>
                  </>
                )}

                {visibleSections.interlock && (
                  <>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800/60 bg-emerald-500/5">LHS</th>
                    <th className="py-1.5 px-2 text-center border-r border-slate-800 bg-emerald-500/5">RHS</th>
                  </>
                )}

                <th className="py-1.5 px-3 text-right bg-slate-950">Grand Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {items.map((it, idx) => {
                if (it.is_header) {
                  return (
                    <tr key={idx} className="bg-yellow-400 text-slate-950 font-black border-y-2 border-yellow-500 shadow-sm">
                      <td className="py-2 px-3 font-mono font-black text-xs border-r border-yellow-500">{it.item_no}</td>
                      <td colSpan={activeColCount - 1} className="py-2 px-3 text-xs uppercase tracking-wider font-extrabold text-slate-950">
                        {it.description}
                      </td>
                    </tr>
                  );
                }

                const itemKey = it.item_no + '_' + it.description;
                const m = itemMeasurements[itemKey] || {
                  gravel_lhs: 0, gravel_rhs: 0,
                  asphalt_lhs: 0, asphalt_rhs: 0,
                  concrete_lhs: 0, concrete_rhs: 0,
                  interlock_lhs: 0, interlock_rhs: 0
                };

                const gravelTotal = (m.gravel_lhs || 0) + (m.gravel_rhs || 0);
                const asphaltTotal = (m.asphalt_lhs || 0) + (m.asphalt_rhs || 0);
                const concreteTotal = (m.concrete_lhs || 0) + (m.concrete_rhs || 0);
                const interlockTotal = (m.interlock_lhs || 0) + (m.interlock_rhs || 0);

                const grandTotal = gravelTotal + asphaltTotal + concreteTotal + interlockTotal;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-bold text-amber-400 border-r border-slate-800">{it.item_no || '-'}</td>
                    <td className="py-2 px-3 font-medium text-slate-100 border-r border-slate-800">{it.description}</td>
                    <td className="py-2 px-2 text-center text-slate-400 border-r border-slate-800 font-semibold">{it.unit || '-'}</td>

                    {/* Gravel Inputs */}
                    {visibleSections.gravel && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-amber-500/5">
                          <input 
                            type="number" 
                            value={m.gravel_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'gravel_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-amber-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-amber-500/5">
                          <input 
                            type="number" 
                            value={m.gravel_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'gravel_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-amber-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Tar/Asphalt Inputs */}
                    {visibleSections.asphalt && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-blue-500/5">
                          <input 
                            type="number" 
                            value={m.asphalt_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'asphalt_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-blue-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-blue-500/5">
                          <input 
                            type="number" 
                            value={m.asphalt_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'asphalt_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-blue-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Concrete Inputs */}
                    {visibleSections.concrete && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-purple-500/5">
                          <input 
                            type="number" 
                            value={m.concrete_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'concrete_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-purple-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-purple-500/5">
                          <input 
                            type="number" 
                            value={m.concrete_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'concrete_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-purple-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Interlock Inputs */}
                    {visibleSections.interlock && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-emerald-500/5">
                          <input 
                            type="number" 
                            value={m.interlock_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'interlock_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-emerald-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-emerald-500/5">
                          <input 
                            type="number" 
                            value={m.interlock_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'interlock_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-emerald-500 focus:bg-slate-950 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Calculated Grand Total */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 bg-slate-950">
                      {grandTotal > 0 ? grandTotal.toLocaleString() : '0'}
                    </td>
                  </tr>
                );
              })}
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
