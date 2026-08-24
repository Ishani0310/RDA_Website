import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileSpreadsheet, 
  Search, 
  Loader2,
  RefreshCw,
  Layers
} from 'lucide-react';

export default function EstimateBuilderView() {
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRoadEstimates();
  }, []);

  const fetchRoadEstimates = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/road-estimates');
      setSections(res.data.sections || []);
      if (res.data.sections && res.data.sections.length > 0) {
        setSelectedSection(res.data.sections[0]);
      }
    } catch (err) {
      console.error('Error fetching road estimates from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center space-y-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        <span className="text-xs font-semibold">Parsing BOQ Line Items directly from Excel Workbook...</span>
      </div>
    );
  }

  const items = selectedSection?.items || [];
  const filteredItems = items.filter(i => 
    i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.item_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.pay_item_no.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Controls & Section Switcher */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white">Road Estimate BOQ Line Items</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live BOQ Pay Items parsed directly from Excel sheets
            </p>
          </div>

          <button 
            onClick={fetchRoadEstimates}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>Refresh Excel Engine</span>
          </button>
        </div>

        {/* Section Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSection(sec)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedSection?.section_name === sec.section_name
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sec.section_name}
            </button>
          ))}
        </div>
      </div>

      {/* BOQ Items Grid */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Pay Item No or Description..."
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Active Section: <span className="text-amber-400 font-bold">{selectedSection?.section_name}</span> ({filteredItems.length} items shown)
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 w-16">Item No</th>
                <th className="py-3 px-3">Pay Item No</th>
                <th className="py-3 px-6">Description of Work (SSCM)</th>
                <th className="py-3 px-3 text-center">Unit</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Rate (LKR)</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-amber-400">{item.item_no}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">{item.pay_item_no || '-'}</td>
                    <td className="py-3 px-6 font-medium text-slate-100">{item.description}</td>
                    <td className="py-3 px-3 text-center text-slate-400">{item.unit || '-'}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">{item.qty.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {item.rate > 0 ? `Rs. ${item.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {item.amount > 0 ? `Rs. ${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '0.00'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                    No BOQ line items found for this section in the Excel file.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
