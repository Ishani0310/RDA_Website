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
  CheckCircle2,
  Info,
  PhoneCall,
  BookOpen,
  HelpCircle,
  Sparkles,
  Search,
  MapPin,
  Ruler
} from 'lucide-react';

const SECTION_DESCRIPTIONS = {
  "2": {
    title: "Section 2: Site Clearance & Preparation",
    code: "SSCM 200",
    desc: "Clearing & grubbing of top soil (150mm), felling & uprooting trees by girth size, removal of stumps, branches, and dismantling of existing structures (masonry, culverts, fencing, floor area).",
    specs: "Measured in Sq.m (area clearing), Nos (tree count), Cu.m (structure dismantling), or L.m (fencing removal)."
  },
  "3": {
    title: "Section 3: Earthworks & Subgrade Construction",
    code: "SSCM 300",
    desc: "Roadway excavation in unclassified soil / rock, base failure repairs, subgrade preparation (100% MDD compaction), embankment construction using approved borrow material (Type I & II), and geofabric layer placement.",
    specs: "Measured in Cu.m (excavation & embankment volumes) or Sq.m (trimming & leveling)."
  },
  "4": {
    title: "Section 4: Pavement Sub-Base & Base Course",
    code: "SSCM 400",
    desc: "Scarification of existing base, aggregate sub-base layer (CBR >= 30%), crushing existing concrete, dense graded Aggregate Base Course (ABC 37.5mm), and shoulder soil compaction.",
    specs: "Measured in Cu.m (compacted volume in position) or Sq.m (scarification)."
  },
  "5": {
    title: "Section 5: Bituminous & Concrete Pavement Surfacing",
    code: "SSCM 500",
    desc: "Tack coat (CRS-1), Prime coat (CSS-1), Asphalt wearing course (40mm using Paver or Manual laying), Asphalt regulating/binder course, Grade 30 concrete surfacing, edge widening, and interlocking cement block paving.",
    specs: "Measured in Sq.m (surface area), Litres/Sq.m (bitumen rate), or Cu.m (concrete volume)."
  },
  "6": {
    title: "Section 6: Drainage Construction & Culvert Cover Slabs",
    code: "SSCM 600",
    desc: "Earth drains, leadaway channels, Precast Concrete L-Drains (AD-1, AD-2), Dish Drains (DD-2, DD-3), U-Drains (UD-1 to UD-4), precast RCC Cover Slabs (Lite & Heavy Duty 100mm-150mm), and subsurface PVC drain pipes.",
    specs: "Measured in L.m (drain run length) or Nos (cover slab units)."
  },
  "7": {
    title: "Section 7: Retaining Wall Construction",
    code: "SSCM 700",
    desc: "Masonry Retaining Walls (MCR-1 to MCR-10, height 1.0m to 6.2m), Reinforced Concrete Retaining Walls (RC-1 to RC-9, height 1.5m to 7.5m), and Concrete Block Gravity (CBG/RBG) walls with pocket filling.",
    specs: "Measured in L.m (wall length at specified height category)."
  },
  "8": {
    title: "Section 8: Culverts & Structural Cross Drainage",
    code: "SSCM 800",
    desc: "Single & Double Row Pipe Culverts with/without concrete encasement (Type 1-6), RCC Box Culverts, Slab Culverts, and pocket mass concrete filling.",
    specs: "Measured in L.m (pipe length) or Cu.m (box/slab concrete)."
  },
  "9": {
    title: "Section 9: Road Marking, Signs & Footwalk Construction",
    code: "SSCM 900",
    desc: "Thermoplastic reflectorized line marking (3mm), single/double pole road signs, chevron warning signs, footwalk kerbs, block paving, gravelly base layer, grass sodding (turfing), and access pipe culverts.",
    specs: "Measured in L.m (line marking/kerbs), Nos (signs), or Sq.m (turfing & paving)."
  },
  "10": {
    title: "Section 10 & 11: Miscellaneous & Safety Works",
    code: "SSCM 1000/1100",
    desc: "Removal of interlock pavement, galvanized W-beam guard rails, pedestrian safety guard fences, and slope protection barriers.",
    specs: "Measured in L.m (guard rail run) or Sq.m (interlock removal)."
  },
  "1": {
    title: "Section 1: Preliminary & General (P&G)",
    code: "SSCM 100",
    desc: "Mobilization/demobilization, maintenance of existing roads, center-line survey & cross-sections, contractor's insurance, Engineer's office & site vehicles (4WD cabs, bikes, SUVs), and provisional sums.",
    specs: "Lump Sum (LS) or Monthly Rate items."
  }
};

export default function DetailSheetView() {
  const [detailSheets, setDetailSheets] = useState(['Detail -1']);
  const [selectedSheet, setSelectedSheet] = useState('Detail -1');
  const [sheetData, setSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Editable Section 1 Metadata Form State
  const [metaFields, setMetaFields] = useState({
    province: 'Central',
    ee_division: 'Kandy EE',
    ce_division: 'Kandy CE',
    electorate: 'Kandy Electorate',
    project_name: 'INCLUSIVE CONNECTIVITY & DEVELOPMENT PROJECT',
    road_name: 'Kandy - Mahiyangana - Padiyathalawa Road Section',
    road_class_and_number: 'Class B (B-124)',
    road_improvement_type: 'Rehabilitation & Asphalt Concrete Surfacing',
    road_length: '4.20 km',
    avg_road_width_existing: '3.80 m',
    road_width_proposed: '4.50 m'
  });

  // Road Surface Length & Width Dimension Table State (Rows 18-22 in user image)
  const [surfaceDimensions, setSurfaceDimensions] = useState({
    gravel_len: 850, gravel_prop_w: 4.5, gravel_exist_w: 3.5,
    asphalt_len: 2400, asphalt_prop_w: 4.5, asphalt_exist_w: 4.0,
    concrete_len: 950, concrete_prop_w: 4.5, concrete_exist_w: 4.5,
    interlock_len: 0, interlock_prop_w: 4.5, interlock_exist_w: 0.0
  });

  // New Detail Sheet Form State
  const [newSheetName, setNewSheetName] = useState('Detail -2');
  const [newProvince, setNewProvince] = useState('Central');
  const [newDistrict, setNewDistrict] = useState('Kandy');
  const [newRoadName, setNewRoadName] = useState('New Road Rehabilitation Section');

  // Interactive Measurement Input State (Single Value vs LHS/RHS)
  const [itemMeasurements, setItemMeasurements] = useState({});

  // Optional Surface Section Toggles
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
      const res = await axios.get(`/api/detail-sheet/${encodeURIComponent(sheetName)}`);
      setSheetData(res.data);
      
      if (res.data.metadata) {
        setMetaFields(prev => ({
          ...prev,
          ...res.data.metadata
        }));
      }

      const initialMap = {};
      (res.data.items || []).forEach(it => {
        if (!it.is_header) {
          initialMap[it.item_no + '_' + it.description] = {
            val_single_gravel: 0, val_single_asphalt: 0, val_single_concrete: 0, val_single_interlock: 0,
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

  const handleMetaChange = (field, value) => {
    setMetaFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDimensionChange = (field, value) => {
    const numVal = parseFloat(value) || 0;
    setSurfaceDimensions(prev => ({
      ...prev,
      [field]: numVal
    }));
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
            is_header: true,
            is_single_value: it.is_single_value !== false
          };
        }
        const itemKey = it.item_no + '_' + it.description;
        const m = itemMeasurements[itemKey] || {};
        return {
          item_no: it.item_no,
          description: it.description,
          unit: it.unit,
          is_header: false,
          is_single_value: it.is_single_value !== false,
          val_single_gravel: m.val_single_gravel || 0,
          val_single_asphalt: m.val_single_asphalt || 0,
          val_single_concrete: m.val_single_concrete || 0,
          val_single_interlock: m.val_single_interlock || 0,
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
        metadata: metaFields,
        surface_dimensions: surfaceDimensions,
        transport_distances: sheetData?.transport_distances || [],
        items: itemsPayload
      }, {
        responseType: 'blob'
      });

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

  const distances = sheetData?.transport_distances || [];
  const items = sheetData?.items || [];

  const filteredItems = items.filter(it => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (it.item_no && it.item_no.toLowerCase().includes(q)) ||
      (it.description && it.description.toLowerCase().includes(q)) ||
      (it.unit && it.unit.toLowerCase().includes(q))
    );
  });

  const activeColCount = 3 + 
    (visibleSections.gravel ? 2 : 0) + 
    (visibleSections.asphalt ? 2 : 0) + 
    (visibleSections.concrete ? 2 : 0) + 
    (visibleSections.interlock ? 2 : 0) + 1;

  const totalLengthM = surfaceDimensions.gravel_len + surfaceDimensions.asphalt_len + surfaceDimensions.concrete_len + surfaceDimensions.interlock_len;

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
              Single Value input for Clearing & Grubbing; Dual LHS/RHS inputs for Removal of Trees & Drains
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
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

      {/* TOP HEADER CONTACT & INFORMATION CARD */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-slate-200 text-sm">Road Development Authority - Data Sheet Technical Contact</div>
            <div className="text-slate-400 text-[11px] flex items-center gap-4 mt-0.5">
              <span><strong>Info Hotline:</strong> 071-2869499</span>
              <span><strong>Executive Office:</strong> 077-2929728</span>
              <span><strong>Total Loaded SSCM Descriptions:</strong> <strong className="text-amber-400">{items.length} items</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-lg border border-slate-800">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="text-[11px] text-slate-300">
            Loaded <strong>{items.length} Pay Item Descriptions</strong> from Excel Engine
          </span>
        </div>
      </div>

      {/* SECTION 1: GENERAL ROAD PROJECT DATA SHEET METADATA HEADER */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Building2 className="w-4 h-4" />
            <span>Section 1: General Road Project Details ({selectedSheet})</span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">
            11 PROJECT METADATA FIELDS
          </span>
        </div>

        {/* 11 EXACT METADATA FIELDS FORM TABLE MATCHING USER IMAGE */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>1. Province</span>
            </label>
            <select 
              value={metaFields.province} 
              onChange={(e) => handleMetaChange('province', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
            >
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
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">2. EE Division</label>
            <input 
              type="text" 
              value={metaFields.ee_division} 
              onChange={(e) => handleMetaChange('ee_division', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">3. CE Division</label>
            <input 
              type="text" 
              value={metaFields.ce_division} 
              onChange={(e) => handleMetaChange('ce_division', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">4. Electorate/s</label>
            <input 
              type="text" 
              value={metaFields.electorate} 
              onChange={(e) => handleMetaChange('electorate', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">5. Project Name</label>
            <input 
              type="text" 
              value={metaFields.project_name} 
              onChange={(e) => handleMetaChange('project_name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-medium focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">6. Road Name</label>
            <input 
              type="text" 
              value={metaFields.road_name} 
              onChange={(e) => handleMetaChange('road_name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">7. Road Class and Number</label>
            <input 
              type="text" 
              value={metaFields.road_class_and_number} 
              onChange={(e) => handleMetaChange('road_class_and_number', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-mono font-medium focus:border-amber-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">8. Road Improvement Type</label>
            <input 
              type="text" 
              value={metaFields.road_improvement_type} 
              onChange={(e) => handleMetaChange('road_improvement_type', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 font-medium focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">9. Road Length</label>
            <input 
              type="text" 
              value={metaFields.road_length} 
              onChange={(e) => handleMetaChange('road_length', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">10. Avg. Road Width (Existing)</label>
            <input 
              type="text" 
              value={metaFields.avg_road_width_existing} 
              onChange={(e) => handleMetaChange('avg_road_width_existing', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 text-[11px] mb-1 font-bold">11. Road width (Proposed)</label>
            <input 
              type="text" 
              value={metaFields.road_width_proposed} 
              onChange={(e) => handleMetaChange('road_width_proposed', e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono font-bold focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: MATERIAL TRANSPORT DISTANCES */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-sm border-b border-slate-800 pb-3">
          <Truck className="w-4 h-4" />
          <span>Section 2: Material Transport Lead Distances (Haulage Estimator Table)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {distances.map((dist, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-slate-200">{dist.material}</div>
                <div className="text-[11px] text-slate-400">Transport haulage distance</div>
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

      {/* ROAD SURFACE LENGTH & WIDTH DIMENSIONS SUMMARY TABLE (ROWS 18-22 MATCHING USER IMAGE EXACTLY) */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Ruler className="w-4 h-4" />
            <span>Road Surface Section Dimensions Summary (Rows 18 to 22)</span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            TOTAL LENGTH: {totalLengthM.toLocaleString()} m
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase text-[11px]">
              <tr className="border-b border-slate-800">
                <th className="py-3 px-3 bg-slate-950 text-amber-400 font-black border-r border-slate-800 w-56">
                  Existing Road Section
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 bg-amber-500/10 text-amber-400 border-t-2 border-t-amber-500 font-extrabold">
                  Gravel Section
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 bg-blue-500/10 text-blue-400 border-t-2 border-t-blue-500 font-extrabold">
                  AC, Macadam, DBST, SBST, Tar Surface Section
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 bg-purple-500/10 text-purple-400 border-t-2 border-t-purple-500 font-extrabold">
                  Concrete Surface Section
                </th>
                <th className="py-2.5 px-3 text-center border-r border-slate-800 bg-emerald-500/10 text-emerald-400 border-t-2 border-t-emerald-500 font-extrabold">
                  Interlock Paved Section
                </th>
                <th className="py-2.5 px-3 text-right bg-slate-950 text-amber-400 font-black border-t-2 border-t-amber-400">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 bg-slate-950/40 text-xs">
              {/* Row 20: Length */}
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-bold text-slate-200 border-r border-slate-800 bg-slate-900/60">Length</td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-amber-500/5">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.gravel_len} 
                      onChange={(e) => handleDimensionChange('gravel_len', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono font-bold text-amber-400"
                    />
                    <span className="text-slate-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-blue-500/5">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.asphalt_len} 
                      onChange={(e) => handleDimensionChange('asphalt_len', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono font-bold text-blue-400"
                    />
                    <span className="text-slate-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-purple-500/5">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.concrete_len} 
                      onChange={(e) => handleDimensionChange('concrete_len', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono font-bold text-purple-400"
                    />
                    <span className="text-slate-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/5">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.interlock_len} 
                      onChange={(e) => handleDimensionChange('interlock_len', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono font-bold text-emerald-400"
                    />
                    <span className="text-slate-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-black text-amber-400 bg-slate-950 text-sm">
                  {totalLengthM.toLocaleString()} m
                </td>
              </tr>

              {/* Row 21: Proposed Width (Matching Green Bar in User Image) */}
              <tr className="bg-emerald-950/30 border-y border-emerald-800/40">
                <td className="py-2.5 px-3 font-bold text-emerald-300 border-r border-slate-800 bg-emerald-900/40">Proposed Width</td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.gravel_prop_w} 
                      onChange={(e) => handleDimensionChange('gravel_prop_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.asphalt_prop_w} 
                      onChange={(e) => handleDimensionChange('asphalt_prop_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.concrete_prop_w} 
                      onChange={(e) => handleDimensionChange('concrete_prop_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.interlock_prop_w} 
                      onChange={(e) => handleDimensionChange('interlock_prop_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300 bg-slate-950">
                  4.5 m
                </td>
              </tr>

              {/* Row 22: Avg. Existing Width (Matching Green Bar in User Image) */}
              <tr className="bg-emerald-950/20">
                <td className="py-2.5 px-3 font-bold text-emerald-300 border-r border-slate-800 bg-emerald-900/30">Avg.Existing Width</td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.gravel_exist_w} 
                      onChange={(e) => handleDimensionChange('gravel_exist_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.asphalt_exist_w} 
                      onChange={(e) => handleDimensionChange('asphalt_exist_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.concrete_exist_w} 
                      onChange={(e) => handleDimensionChange('concrete_exist_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2 px-2 border-r border-slate-800 text-center bg-emerald-500/10">
                  <div className="flex items-center justify-center gap-1">
                    <input 
                      type="number" 
                      value={surfaceDimensions.interlock_exist_w} 
                      onChange={(e) => handleDimensionChange('interlock_exist_w', e.target.value)}
                      className="w-20 px-2 py-1 bg-slate-900 border border-emerald-700 rounded text-right font-mono font-bold text-emerald-300"
                    />
                    <span className="text-emerald-400 font-semibold text-[11px]">m</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-300 bg-slate-950">
                  3.8 m
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION SPECIFICATIONS & DESCRIPTIONS CARD BLOCK */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <BookOpen className="w-4 h-4" />
            <span>RDA Engineering Section Standard Specifications (SSCM Reference)</span>
          </div>
          <span className="text-xs text-slate-400">Click any section card to inspect technical specs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {Object.entries(SECTION_DESCRIPTIONS).map(([secKey, sInfo]) => (
            <div 
              key={secKey} 
              onClick={() => setSelectedCategoryInfo(sInfo)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedCategoryInfo?.title === sInfo.title 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-slate-200 text-xs">{sInfo.title}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded">
                  {sInfo.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {sInfo.desc}
              </p>
              <div className="mt-2 text-[10px] text-amber-400 font-medium flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>{sInfo.specs}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: OPTIONAL SURFACE SECTIONS TOGGLE, DESCRIPTION SEARCH & ENTRY MATRIX */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Section 3: SSCM Measurement Matrix ({filteredItems.length} Descriptions Loaded)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Single Value input for Clearing & Grubbing; Dual LHS/RHS inputs for Removal of Trees & Drains
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* SEARCH DESCRIPTION INPUT */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search pay item description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 w-64"
              />
            </div>

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
                  SSCM Item & Full Description of Work
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
            </thead>

            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredItems.map((it, idx) => {
                const descStr = it.description || '';
                const itemNoStr = it.item_no || '';

                if (it.is_header) {
                  const isTreeCategory = descStr.includes("Removal of Trees") || descStr.includes("Trees") || itemNoStr === "2.2";
                  const secCode = itemNoStr ? itemNoStr.split('.')[0] : "2";
                  const sInfo = SECTION_DESCRIPTIONS[secCode];

                  return (
                    <React.Fragment key={idx}>
                      {/* Category Yellow Banner Row */}
                      <tr className="bg-yellow-400 text-slate-950 font-black border-y-2 border-yellow-500 shadow-sm">
                        <td className="py-2.5 px-3 font-mono font-black text-xs border-r border-yellow-500">{itemNoStr || 'SEC'}</td>
                        <td colSpan={activeColCount - 1} className="py-2.5 px-3 text-xs uppercase tracking-wider font-extrabold text-slate-950">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                            <span>{descStr}</span>
                            {sInfo && (
                              <span className="text-[10px] normal-case font-normal text-slate-900 bg-yellow-300/80 px-2 py-0.5 rounded border border-yellow-600/40">
                                {sInfo.code}: {sInfo.specs}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {/* Sub-header Row ONLY for categories with LHS / RHS breakdown */}
                      {isTreeCategory && (
                        <tr className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 text-[9px]">
                          <td colSpan={3} className="py-1.5 px-3 text-right font-bold text-amber-400 border-r border-slate-800 uppercase tracking-wider">
                            Section Entry Sub-Headers
                          </td>
                          {visibleSections.gravel && (
                            <>
                              <td className="py-1 px-1 text-center border-r border-slate-800/60 bg-amber-500/10 font-bold text-amber-400">LHS</td>
                              <td className="py-1 px-1 text-center border-r border-slate-800 bg-amber-500/10 font-bold text-amber-400">RHS</td>
                            </>
                          )}
                          {visibleSections.asphalt && (
                            <>
                              <td className="py-1 px-1 text-center border-r border-slate-800/60 bg-blue-500/10 font-bold text-blue-400">LHS</td>
                              <td className="py-1 px-1 text-center border-r border-slate-800 bg-blue-500/10 font-bold text-blue-400">RHS</td>
                            </>
                          )}
                          {visibleSections.concrete && (
                            <>
                              <td className="py-1 px-1 text-center border-r border-slate-800/60 bg-purple-500/10 font-bold text-purple-400">LHS</td>
                              <td className="py-1 px-1 text-center border-r border-slate-800 bg-purple-500/10 font-bold text-purple-400">RHS</td>
                            </>
                          )}
                          {visibleSections.interlock && (
                            <>
                              <td className="py-1 px-1 text-center border-r border-slate-800/60 bg-emerald-500/10 font-bold text-emerald-400">LHS</td>
                              <td className="py-1 px-1 text-center border-r border-slate-800 bg-emerald-500/10 font-bold text-emerald-400">RHS</td>
                            </>
                          )}
                          <td className="py-1 px-2 text-right bg-slate-950 font-bold text-amber-400">Total</td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                }

                const itemKey = itemNoStr + '_' + descStr;
                const m = itemMeasurements[itemKey] || {
                  val_single_gravel: 0, val_single_asphalt: 0, val_single_concrete: 0, val_single_interlock: 0,
                  gravel_lhs: 0, gravel_rhs: 0,
                  asphalt_lhs: 0, asphalt_rhs: 0,
                  concrete_lhs: 0, concrete_rhs: 0,
                  interlock_lhs: 0, interlock_rhs: 0
                };

                const isSingleValue = it.is_single_value || descStr.includes("Cumulative Area") || descStr.includes("Clearing");

                if (isSingleValue) {
                  // SINGLE VALUE ROW (e.g. Clearing & Grubbing Cumulative Area) - ONE INPUT BOX PER SECTION
                  const gravelVal = m.val_single_gravel || 0;
                  const asphaltVal = m.val_single_asphalt || 0;
                  const concreteVal = m.val_single_concrete || 0;
                  const interlockVal = m.val_single_interlock || 0;
                  const grandTotal = gravelVal + asphaltVal + concreteVal + interlockVal;

                  return (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors bg-amber-950/10">
                      <td className="py-2 px-2 font-bold text-amber-400 border-r border-slate-800 font-mono text-[11px]">
                        {itemNoStr || '-'}
                      </td>
                      <td className="py-2 px-3 font-bold text-slate-100 border-r border-slate-800 leading-relaxed text-xs">
                        {descStr}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-400 border-r border-slate-800 font-semibold text-[10px]">
                        {it.unit ? (
                          <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-amber-300/90 font-mono">
                            {it.unit}
                          </span>
                        ) : '-'}
                      </td>

                      {/* Single Value Gravel Input (Merged width across 2 columns) */}
                      {visibleSections.gravel && (
                        <td colSpan={2} className="py-1.5 px-2 text-center border-r border-slate-800 bg-amber-500/5">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              value={m.val_single_gravel || ''} 
                              onChange={(e) => handleInputChange(itemKey, 'val_single_gravel', e.target.value)}
                              placeholder="0"
                              className="w-24 px-2 py-1 bg-slate-900 border border-amber-600/60 rounded text-center font-mono text-amber-300 font-bold text-xs focus:bg-slate-950"
                            />
                            <span className="text-[10px] font-semibold text-slate-400">{it.unit || 'Sq.m'}</span>
                          </div>
                        </td>
                      )}

                      {/* Single Value Asphalt Input */}
                      {visibleSections.asphalt && (
                        <td colSpan={2} className="py-1.5 px-2 text-center border-r border-slate-800 bg-blue-500/5">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              value={m.val_single_asphalt || ''} 
                              onChange={(e) => handleInputChange(itemKey, 'val_single_asphalt', e.target.value)}
                              placeholder="0"
                              className="w-24 px-2 py-1 bg-slate-900 border border-blue-600/60 rounded text-center font-mono text-blue-300 font-bold text-xs focus:bg-slate-950"
                            />
                            <span className="text-[10px] font-semibold text-slate-400">{it.unit || 'Sq.m'}</span>
                          </div>
                        </td>
                      )}

                      {/* Single Value Concrete Input */}
                      {visibleSections.concrete && (
                        <td colSpan={2} className="py-1.5 px-2 text-center border-r border-slate-800 bg-purple-500/5">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              value={m.val_single_concrete || ''} 
                              onChange={(e) => handleInputChange(itemKey, 'val_single_concrete', e.target.value)}
                              placeholder="0"
                              className="w-24 px-2 py-1 bg-slate-900 border border-purple-600/60 rounded text-center font-mono text-purple-300 font-bold text-xs focus:bg-slate-950"
                            />
                            <span className="text-[10px] font-semibold text-slate-400">{it.unit || 'Sq.m'}</span>
                          </div>
                        </td>
                      )}

                      {/* Single Value Interlock Input */}
                      {visibleSections.interlock && (
                        <td colSpan={2} className="py-1.5 px-2 text-center border-r border-slate-800 bg-emerald-500/5">
                          <div className="flex items-center justify-center gap-1.5">
                            <input 
                              type="number" 
                              value={m.val_single_interlock || ''} 
                              onChange={(e) => handleInputChange(itemKey, 'val_single_interlock', e.target.value)}
                              placeholder="0"
                              className="w-24 px-2 py-1 bg-slate-900 border border-emerald-600/60 rounded text-center font-mono text-emerald-300 font-bold text-xs focus:bg-slate-950"
                            />
                            <span className="text-[10px] font-semibold text-slate-400">{it.unit || 'Sq.m'}</span>
                          </div>
                        </td>
                      )}

                      {/* Grand Total */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-400 bg-slate-950">
                        {grandTotal > 0 ? grandTotal.toLocaleString() : '0'}
                      </td>
                    </tr>
                  );
                }

                // DUAL LHS / RHS INPUT ROW (e.g. Removal of Trees)
                const gravelTotal = (m.gravel_lhs || 0) + (m.gravel_rhs || 0);
                const asphaltTotal = (m.asphalt_lhs || 0) + (m.asphalt_rhs || 0);
                const concreteTotal = (m.concrete_lhs || 0) + (m.concrete_rhs || 0);
                const interlockTotal = (m.interlock_lhs || 0) + (m.interlock_rhs || 0);
                const grandTotal = gravelTotal + asphaltTotal + concreteTotal + interlockTotal;

                return (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-2 font-bold text-amber-400 border-r border-slate-800 font-mono text-[11px]">
                      {itemNoStr || '-'}
                    </td>
                    <td className="py-2 px-3 font-medium text-slate-100 border-r border-slate-800 leading-relaxed text-xs">
                      {descStr}
                    </td>
                    <td className="py-2 px-2 text-center text-slate-400 border-r border-slate-800 font-semibold text-[10px]">
                      {it.unit ? (
                        <span className="px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 text-amber-300/90 font-mono">
                          {it.unit}
                        </span>
                      ) : '-'}
                    </td>

                    {/* Gravel LHS & RHS Inputs */}
                    {visibleSections.gravel && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-amber-500/5">
                          <input 
                            type="number" 
                            value={m.gravel_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'gravel_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-amber-500 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-amber-500/5">
                          <input 
                            type="number" 
                            value={m.gravel_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'gravel_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-amber-500 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Tar/Asphalt LHS & RHS Inputs */}
                    {visibleSections.asphalt && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-blue-500/5">
                          <input 
                            type="number" 
                            value={m.asphalt_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'asphalt_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-blue-500 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-blue-500/5">
                          <input 
                            type="number" 
                            value={m.asphalt_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'asphalt_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-blue-500 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Concrete LHS & RHS Inputs */}
                    {visibleSections.concrete && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-purple-500/5">
                          <input 
                            type="number" 
                            value={m.concrete_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'concrete_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-purple-500 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-purple-500/5">
                          <input 
                            type="number" 
                            value={m.concrete_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'concrete_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-purple-500 font-semibold"
                          />
                        </td>
                      </>
                    )}

                    {/* Interlock LHS & RHS Inputs */}
                    {visibleSections.interlock && (
                      <>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800/40 bg-emerald-500/5">
                          <input 
                            type="number" 
                            value={m.interlock_lhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'interlock_lhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-emerald-500 font-semibold"
                          />
                        </td>
                        <td className="py-1.5 px-1 text-center border-r border-slate-800 bg-emerald-500/5">
                          <input 
                            type="number" 
                            value={m.interlock_rhs || ''} 
                            onChange={(e) => handleInputChange(itemKey, 'interlock_rhs', e.target.value)}
                            placeholder="0"
                            className="w-16 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-right font-mono text-slate-100 text-xs focus:border-emerald-500 font-semibold"
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
