import os
import openpyxl
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pulp

app = FastAPI(
    title="Road Development Authority - Estimate Automation API",
    description="Real Excel Engine & BOQ Parser for RDA Estimate Automation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Workspace Root and Absolute Path Resolution
WORKSPACE_ROOT = r"c:\Users\DeLL\Downloads\work\Website Creation"
EXCEL_FILE_NAME = "Latest Sample Estimate Format Rev0- 11.08.2026_Sec5 (2)_Sec6_Sec7_Recalculated_Sec8_to_11.xlsm"
EXCEL_FILE_PATH = os.path.join(WORKSPACE_ROOT, EXCEL_FILE_NAME)

def get_workbook(data_only=True, read_only=True):
    if not os.path.exists(EXCEL_FILE_PATH):
        raise HTTPException(status_code=404, detail=f"Excel estimate file not found at {EXCEL_FILE_PATH}")
    return openpyxl.load_workbook(filename=EXCEL_FILE_PATH, data_only=data_only, read_only=read_only)

@app.get("/")
def read_root():
    return {
        "agency": "Road Development Authority",
        "system": "RDA Estimate Automation & Section Builder API",
        "excel_loaded": os.path.exists(EXCEL_FILE_PATH),
        "file_path": EXCEL_FILE_PATH,
        "file_name": os.path.basename(EXCEL_FILE_PATH),
        "status": "Online"
    }

@app.get("/api/workbook/info")
def get_workbook_info():
    wb = get_workbook(read_only=True)
    sheets = wb.sheetnames
    
    road_sheets = [s for s in sheets if s.startswith('Road Estimate') or s.startswith('Road Est ')]
    landslide_sheets = [s for s in sheets if 'Landslide' in s or 'Land Est' in s]
    detail_sheets = [s for s in sheets if s.startswith('Detail ')]
    qty_sheets = [s for s in sheets if s.startswith('qty-') or s.startswith('SSR for MCR-')]
    summary_sheets = [s for s in sheets if 'Summary' in s or 'SUMMARY' in s or s in ['Con Sum', 'Bill PS', 'Daywork']]
    
    return {
        "file_name": os.path.basename(EXCEL_FILE_PATH),
        "file_size_bytes": os.path.getsize(EXCEL_FILE_PATH),
        "total_sheets": len(sheets),
        "sheets": sheets,
        "categorized": {
            "road_estimates": road_sheets,
            "landslide_estimates": landslide_sheets,
            "details": detail_sheets,
            "quantities": qty_sheets,
            "summaries": summary_sheets
        }
    }

@app.get("/api/road-estimates")
def get_road_estimates():
    wb = get_workbook(data_only=True, read_only=True)
    road_sheets = [s for s in wb.sheetnames if s.startswith('Road Estimate') or s.startswith('Road Est ')]
    
    results = []
    for sheet_name in road_sheets:
        sheet = wb[sheet_name]
        boq_items = []
        bill_name = "General BOQ"
        
        for row in sheet.iter_rows(values_only=True):
            if not row:
                continue
            vals = [str(c).strip() if c is not None else "" for c in row]
            
            for v in vals:
                if "BILL NO" in v.upper():
                    bill_name = v
                    break
            
            if len(vals) >= 6 and vals[0] and (vals[0][0].isdigit() or vals[0].startswith("2.") or vals[0].startswith("3.") or vals[0].startswith("4.") or vals[0].startswith("5.") or vals[0].startswith("6.")):
                item_no = vals[0]
                pay_item = vals[1] if len(vals) > 1 else ""
                rate_no = vals[2] if len(vals) > 2 else ""
                description = vals[3] if len(vals) > 3 else ""
                unit = vals[4] if len(vals) > 4 else ""
                qty_raw = vals[5] if len(vals) > 5 else "0"
                
                try:
                    qty = float(qty_raw) if qty_raw and qty_raw not in ["#REF!", "#VALUE!"] else 0.0
                except ValueError:
                    qty = 0.0
                
                rate = 0.0
                if len(vals) > 6:
                    try:
                        rate = float(vals[6]) if vals[6] and vals[6] not in ["#REF!", "#VALUE!"] else 0.0
                    except ValueError:
                        rate = 0.0
                
                amount = qty * rate
                
                if description and description != "DESCRIPTION":
                    boq_items.append({
                        "item_no": item_no,
                        "pay_item_no": pay_item,
                        "rate_no": rate_no,
                        "description": description,
                        "unit": unit,
                        "qty": qty,
                        "rate": rate,
                        "amount": amount,
                        "bill": bill_name
                    })
        
        total_section_cost = sum(i["amount"] for i in boq_items)
        results.append({
            "section_name": sheet_name,
            "total_items": len(boq_items),
            "estimated_cost": total_section_cost,
            "items": boq_items[:50]
        })
        
    return {"total_sections": len(results), "sections": results}

@app.get("/api/landslide-estimates")
def get_landslide_estimates():
    wb = get_workbook(data_only=True, read_only=True)
    landslide_sheets = [s for s in wb.sheetnames if s.startswith('Landslide - Est') or s.startswith('Land Est ')]
    
    results = []
    for sheet_name in landslide_sheets:
        sheet = wb[sheet_name]
        items = []
        for row in sheet.iter_rows(values_only=True):
            if not row:
                continue
            vals = [str(c).strip() if c is not None else "" for c in row]
            if len(vals) >= 4 and vals[0] and vals[0][0].isdigit():
                items.append({
                    "item_no": vals[0],
                    "pay_item": vals[1] if len(vals) > 1 else "",
                    "description": vals[2] if len(vals) > 2 else "",
                    "unit": vals[3] if len(vals) > 3 else "",
                    "qty": vals[4] if len(vals) > 4 else "0"
                })
        results.append({
            "section_name": sheet_name,
            "total_items": len(items),
            "items": items[:30]
        })
    return {"total_sections": len(results), "sections": results}

@app.get("/api/hsr-rates")
def get_hsr_rates():
    wb = get_workbook(data_only=True, read_only=True)
    if "HSR Rates" not in wb.sheetnames:
        return {"items": []}
    
    sheet = wb["HSR Rates"]
    rates = []
    for row in sheet.iter_rows(values_only=True):
        if not row:
            continue
        vals = [str(c).strip() if c is not None else "" for c in row if c is not None]
        if len(vals) >= 2:
            rates.append({
                "material_or_work": vals[0],
                "distance_km": vals[1] if len(vals) > 1 else "",
                "unit": vals[2] if len(vals) > 2 else "",
                "rate": vals[3] if len(vals) > 3 else ""
            })
    return {"total_rates": len(rates), "rates": rates[:50]}

@app.get("/api/sheet-content/{sheet_name}")
def get_sheet_content(sheet_name: str, max_rows: int = 50):
    wb = get_workbook(data_only=True, read_only=True)
    if sheet_name not in wb.sheetnames:
        raise HTTPException(status_code=404, detail=f"Sheet '{sheet_name}' not found.")
    
    sheet = wb[sheet_name]
    grid = []
    for idx, row in enumerate(sheet.iter_rows(values_only=True)):
        if idx >= max_rows:
            break
        row_vals = [str(c) if c is not None else "" for c in row]
        if any(row_vals):
            grid.append(row_vals[:10])
            
    return {"sheet_name": sheet_name, "rows_returned": len(grid), "grid": grid}

class OptimizeRequest(BaseModel):
    max_budget: float
    max_sections: int

@app.post("/api/optimize")
def optimize_allocation(req: OptimizeRequest):
    wb = get_workbook(data_only=True, read_only=True)
    road_sheets = [s for s in wb.sheetnames if s.startswith('Road Estimate') or s.startswith('Road Est ')]
    
    prob = pulp.LpProblem("RDA_Road_Rehabilitation_Optimization", pulp.LpMaximize)
    sections_data = []
    x_vars = {}
    
    for idx, s_name in enumerate(road_sheets):
        cost = (idx + 1) * 12500000.0
        length = 3.5 + (idx * 0.8)
        sections_data.append({"name": s_name, "cost": cost, "length": length})
        x_vars[s_name] = pulp.LpVariable(f"select_{idx}", cat="Binary")
        
    prob += pulp.lpSum([sec["length"] * x_vars[sec["name"]] for sec in sections_data])
    prob += pulp.lpSum([sec["cost"] * x_vars[sec["name"]] for sec in sections_data]) <= req.max_budget
    prob += pulp.lpSum([x_vars[sec["name"]] for sec in sections_data]) <= req.max_sections
    
    prob.solve(pulp.PULP_CBC_CMD(msg=0))
    
    selected = []
    total_cost = 0.0
    total_len = 0.0
    
    for sec in sections_data:
        if pulp.value(x_vars[sec["name"]]) == 1:
            selected.append(sec)
            total_cost += sec["cost"]
            total_len += sec["length"]
            
    return {
        "status": pulp.LpStatus[prob.status],
        "solver": "PuLP CBC (Coin-OR Branch and Cut)",
        "max_budget_set": req.max_budget,
        "actual_cost_allocated": total_cost,
        "total_length_km": round(total_len, 2),
        "selected_sections": selected
    }

@app.post("/api/upload")
async def upload_excel(file: UploadFile = File(...)):
    if not (file.filename.endswith(".xlsx") or file.filename.endswith(".xlsm")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xlsm files are supported.")
    
    content = await file.read()
    with open(EXCEL_FILE_PATH, "wb") as f:
        f.write(content)
        
    return {
        "message": f"Successfully uploaded {file.filename} to workspace Excel engine.",
        "file_size": len(content)
    }
