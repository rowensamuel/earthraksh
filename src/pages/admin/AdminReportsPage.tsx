import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DownloadIcon, ReportsIcon } from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { adminService } from '../../services/adminService';
import { farmService } from '../../services/farmService';
import { cropService } from '../../services/cropService';
import { inventoryService } from '../../services/inventoryService';
import { equipmentService } from '../../services/equipmentService';
import { marketplaceService } from '../../services/marketplaceService';
import { orderService } from '../../services/orderService';
import { financeService } from '../../services/financeService';
import { downloadCSV, downloadXLSX, downloadPDF } from '../../utils/fileDownloader';
import { User, Farm, Crop, InventoryItem, Equipment, MarketplaceProduct, Order, FinanceRecord } from '../../types';

interface ReportModule {
  id: string;
  name: string;
  category: string;
  description: string;
  recordsCount: number;
  lastGenerated: string;
}

export const AdminReportsPage: React.FC = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [finance, setFinance] = useState<FinanceRecord[]>([]);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [u, f, c, inv, eq, p, o, fin] = await Promise.allSettled([
          adminService.getAllUsers(),
          farmService.getFarms(),
          cropService.getCrops(),
          inventoryService.getInventory(),
          equipmentService.getEquipment(),
          marketplaceService.getAllProductsAdmin(),
          orderService.getOrders(),
          financeService.getFinance()
        ]);

        if (u.status === 'fulfilled') setUsers(u.value);
        if (f.status === 'fulfilled') setFarms(f.value);
        if (c.status === 'fulfilled') setCrops(c.value);
        if (inv.status === 'fulfilled') setInventory(inv.value);
        if (eq.status === 'fulfilled') setEquipment(eq.value);
        if (p.status === 'fulfilled') setProducts(p.value);
        if (o.status === 'fulfilled') setOrders(o.value);
        if (fin.status === 'fulfilled') setFinance(fin.value);
      } catch (err) {
        console.warn('Live reports data fetch note:', err);
      }
    };

    fetchLiveData();
  }, []);

  const reports: ReportModule[] = [
    {
      id: 'REP-USR',
      name: 'User Accreditation & Tenant Registry',
      category: 'User Compliance',
      description: 'Audit log of all registered farmers, commercial buyers, and administrative actors with identity verification status.',
      recordsCount: users.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-FRM',
      name: 'Regional Farmland Cadastral Survey',
      category: 'Farm GIS & Land',
      description: 'Total acreage, cadastral bounds, soil classifications, and water infrastructure across all active agrarian clusters.',
      recordsCount: farms.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-CRP',
      name: 'Agronomic Yield & Life-Cycle Ledger',
      category: 'Crop Intelligence',
      description: 'Sowing schedules, growth stages, historical yield metrics, and active pathology outbreaks by district.',
      recordsCount: crops.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-INV',
      name: 'Central Agrochemical & Inputs Audit',
      category: 'Inventory & Supplies',
      description: 'Buffer stock levels, seed viability, batch expiry alerts, and fertilizer reserve audits across storage depots.',
      recordsCount: inventory.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-EQP',
      name: 'Heavy Machinery Fleet & Sharing Log',
      category: 'Equipment Logistics',
      description: 'Machinery operational telemetry, maintenance cycles, tractor rental utilization, and operator certifications.',
      recordsCount: equipment.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-MKT',
      name: 'Marketplace Produce Liquidity Ledger',
      category: 'Marketplace & Trade',
      description: 'Active wholesale listings, quality grades, minimum support pricing (MSP) benchmark comparison, and trade velocity.',
      recordsCount: products.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-ORD',
      name: 'Wholesale Trade Transit & Custody Audit',
      category: 'Orders & Dispatch',
      description: 'Farm-to-buyer consignments, gate-pass verifications, transit logistics tracking, and weighbridge discrepancy notes.',
      recordsCount: orders.length,
      lastGenerated: 'Today, Live Audit'
    },
    {
      id: 'REP-FIN',
      name: 'Fiscal Settlement & Escrow Gateway Ledger',
      category: 'Finance & Escrow',
      description: 'Disbursement audits, platform commission settlements, input credit loans, and escrow clearance verifications.',
      recordsCount: finance.length,
      lastGenerated: 'Today, Live Audit'
    }
  ];

  const handleDownload = (rep: ReportModule, format: 'CSV' | 'XLSX' | 'PDF') => {
    setDownloadingId(`${rep.id}-${format}`);
    setTimeout(() => {
      try {
        if (rep.id === 'REP-USR') {
          const exportUsers: User[] = users;
          const headers = ['User ID', 'Full Name', 'Role', 'Status', 'Email', 'Mobile', 'Designation', 'Address'];
          const rows = exportUsers.map((u: User) => [u.user_id, u.full_name, u.role, u.status, u.email, u.mobile, u.designation || '', u.address]);
          if (format === 'CSV') downloadCSV('EarthRakshak_User_Registry', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_User_Registry', 'User Accreditation Registry', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_User_Registry',
              'User Accreditation Registry',
              'User Compliance',
              `Official ledger containing ${exportUsers.length} registered system users with active authentication credentials.`,
              exportUsers.map((u: User) => ({ label: `${u.full_name} (${u.user_id})`, value: `${u.role} | Status: ${u.status} | Location: ${u.address}` }))
            );
          }
        } else if (rep.id === 'REP-FRM') {
          const exportFarms: Farm[] = farms;
          const headers = ['Farm ID', 'Farm Name', 'Owner ID', 'Area (Acres)', 'Soil Type', 'Water Source', 'Location'];
          const rows = exportFarms.map((f: Farm) => [f.farm_id, f.farm_name, f.user_id, f.area, f.soil_type, f.water_source, f.location]);
          if (format === 'CSV') downloadCSV('EarthRakshak_Farmland_Survey', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Farmland_Survey', 'Regional Farmland Cadastral Survey', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Farmland_Survey',
              'Regional Farmland & Irrigation Survey',
              'Farm GIS & Land',
              'Comprehensive audit of all registered agrarian plots, cadastral boundaries, and primary irrigation infrastructure.',
              exportFarms.map((f: Farm) => ({
                label: `${f.farm_name} (${f.farm_id})`,
                value: `${f.area} ${f.area_unit} | Soil: ${f.soil_type} | Irrigation: ${f.water_source} | Location: ${f.location}`
              }))
            );
          }
        } else if (rep.id === 'REP-CRP') {
          const exportCrops: Crop[] = crops;
          const headers = ['Crop ID', 'Crop Name', 'Variety', 'Season', 'Status', 'Sowing Date', 'Harvest Date', 'Expected Yield (MT)', 'Health Score %'];
          const rows = exportCrops.map((c: Crop) => [c.crop_id, c.crop_name, c.variety, c.season, c.status, c.planting_date, c.expected_harvest, c.expected_yield, c.health_score]);
          if (format === 'CSV') downloadCSV('EarthRakshak_Crop_Yield_Ledger', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Crop_Yield_Ledger', 'Crop Yield & Life-Cycle Ledger', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Crop_Yield_Ledger',
              'Agronomic Crop Yield & Life-Cycle Ledger',
              'Crop Intelligence',
              'Detailed agricultural life-cycle status, harvest projections, and health telemetry across farming blocks.',
              exportCrops.map((c: Crop) => ({
                label: `${c.crop_name} (${c.variety})`,
                value: `Season: ${c.season} | Status: ${c.status} | Yield: ${c.expected_yield} MT | Health: ${c.health_score}%`
              }))
            );
          }
        } else if (rep.id === 'REP-INV') {
          const exportInventory: InventoryItem[] = inventory;
          const headers = ['SKU ID', 'Item Name', 'Category', 'Quantity', 'Unit', 'Unit Cost (INR)', 'Supplier', 'Stock Status'];
          const rows = exportInventory.map((i: InventoryItem) => [i.item_id, i.item_name, i.category, i.quantity, i.unit, i.unit_price, i.supplier, i.status]);
          if (format === 'CSV') downloadCSV('EarthRakshak_Agrochemical_Inventory', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Agrochemical_Inventory', 'Central Agrochemical & Inputs Audit', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Agrochemical_Inventory',
              'Central Agrochemical & Inputs Audit',
              'Inventory & Supplies',
              'Buffer stock levels, seed viability records, batch expiry notices, and fertilizer reserves.',
              exportInventory.map((i: InventoryItem) => ({
                label: `${i.item_name} (${i.item_id})`,
                value: `${i.quantity} ${i.unit} @ INR ${i.unit_price} | Supplier: ${i.supplier} | Status: ${i.status}`
              }))
            );
          }
        } else if (rep.id === 'REP-EQP') {
          const exportEquipment: Equipment[] = equipment;
          const headers = ['Equipment ID', 'Name', 'Model', 'Rental Rate/Day (INR)', 'Availability', 'Condition', 'Owner', 'Location'];
          const rows = exportEquipment.map((e: Equipment) => [e.equipment_id, e.equipment_name, e.model, e.rental_rate_per_day, e.availability_status, e.condition_status, e.owner_name || '', e.location || '']);
          if (format === 'CSV') downloadCSV('EarthRakshak_Equipment_Fleet_Log', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Equipment_Fleet_Log', 'Heavy Machinery Fleet & Sharing Log', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Equipment_Fleet_Log',
              'Machinery Fleet Rental & Maintenance Log',
              'Equipment Reports',
              'Machinery sharing pool utilization, tractor tariffs, and scheduled maintenance records.',
              exportEquipment.map((e: Equipment) => ({
                label: `${e.equipment_name} (${e.model})`,
                value: `Tariff: INR ${e.rental_rate_per_day}/day | Status: ${e.availability_status} | Condition: ${e.condition_status}`
              }))
            );
          }
        } else if (rep.id === 'REP-MKT') {
          const exportProducts: MarketplaceProduct[] = products;
          const headers = ['Product ID', 'Produce Name', 'Category', 'Price/Unit (INR)', 'Unit', 'Available Qty', 'Producer', 'Certification', 'Grade', 'Status'];
          const rows = exportProducts.map((p: MarketplaceProduct) => [p.product_id, p.product_name, p.category, p.price_per_unit, p.unit, p.available_qty, p.seller_name, p.certification, p.grade, p.status]);
          if (format === 'CSV') downloadCSV('EarthRakshak_Marketplace_Produce_Ledger', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Marketplace_Produce_Ledger', 'Marketplace Produce Liquidity Ledger', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Marketplace_Produce_Ledger',
              'Marketplace Produce Liquidity Ledger',
              'Marketplace & Trade',
              'Active wholesale listings, quality grades, minimum support pricing (MSP) benchmark comparison, and trade velocity.',
              exportProducts.map((p: MarketplaceProduct) => ({
                label: `${p.product_name} (${p.category})`,
                value: `Price: INR ${p.price_per_unit}/${p.unit} | Stock: ${p.available_qty} ${p.unit} | Producer: ${p.seller_name}`
              }))
            );
          }
        } else if (rep.id === 'REP-ORD') {
          const exportOrders: Order[] = orders;
          const headers = ['Order ID', 'Buyer Name', 'Order Date', 'Total Amount (INR)', 'Status', 'Payment Method', 'Payment Status', 'Tracking Number'];
          const rows = exportOrders.map((o: Order) => [o.order_id, o.buyer_name, o.order_date, o.total_amount, o.order_status, o.payment_method, o.payment_status, o.tracking_number || 'N/A']);
          if (format === 'CSV') downloadCSV('EarthRakshak_Wholesale_Orders_Transit', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Wholesale_Orders_Transit', 'Wholesale Trade Transit & Custody Audit', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Wholesale_Orders_Transit',
              'Wholesale Trade Transit & Custody Audit',
              'Orders & Dispatch',
              'Consolidated record of all commercial transactions, logistics transit milestones, and settlement confirmations.',
              exportOrders.map((o: Order) => ({
                label: `Order ${o.order_id} - ${o.buyer_name}`,
                value: `Amount: INR ${o.total_amount.toLocaleString()} | Status: ${o.order_status} | Payment: ${o.payment_status}`
              }))
            );
          }
        } else if (rep.id === 'REP-FIN') {
          const exportFinance: FinanceRecord[] = finance;
          const headers = ['Voucher ID', 'Transaction Date', 'Type', 'Category', 'Amount (INR)', 'Reference No', 'Description'];
          const rows = exportFinance.map((f: FinanceRecord) => [f.finance_id, f.transaction_date, f.transaction_type, f.category, f.amount, f.reference_no, f.description]);
          if (format === 'CSV') downloadCSV('EarthRakshak_Fiscal_Ledger', headers, rows);
          else if (format === 'XLSX') downloadXLSX('EarthRakshak_Fiscal_Ledger', 'Fiscal Settlement & Escrow Gateway Ledger', headers, rows);
          else {
            downloadPDF(
              'EarthRakshak_Fiscal_Ledger',
              'Fiscal Settlement & Escrow Gateway Ledger',
              'Finance & Escrow',
              'Disbursement audits, platform commission settlements, and escrow clearance verifications.',
              exportFinance.map((f: FinanceRecord) => ({
                label: `${f.reference_no} (${f.finance_id})`,
                value: `${f.transaction_type} INR ${f.amount.toLocaleString()} | Category: ${f.category} | ${f.transaction_date}`
              }))
            );
          }
        }
        showToast('Report Downloaded', 'success', `${rep.name} (${format}) generated successfully.`);
      } catch {
        showToast('Export Error', 'error', 'Failed to generate report file.');
      } finally {
        setDownloadingId(null);
      }
    }, 300);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Enterprise Compliance & Auditing"
        title="Official Agricultural Intelligence Reports"
        description="Extract regulatory, agronomic, supply chain, and financial ledgers formatted for government reporting, agricultural census, and banking audit compliance."
        actions={
          <div className="flex items-center gap-1.5 text-xs text-[#5e7362]">
            <ReportsIcon size={16} />
            <span>8 Compliance Modules Active</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(rep => (
          <div key={rep.id} className="bg-white border border-[#dbe3d8] p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1b5e20] bg-[#eef4ec] px-2 py-0.5 border border-[#d2e0cf]">
                  {rep.category}
                </span>
                <span className="text-xs font-semibold text-[#576b5a] tabular-nums">
                  {rep.recordsCount} Records Available
                </span>
              </div>
              <h3 className="text-sm font-bold font-display text-[#14291a] mb-1">
                {rep.name}
              </h3>
              <p className="text-xs text-[#5c7360] leading-relaxed mb-4">
                {rep.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#edf1ea] flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-[#788e7b]">Updated: {rep.lastGenerated}</span>
              
              {/* Multi-format export buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDownload(rep, 'PDF')}
                  disabled={downloadingId === `${rep.id}-PDF`}
                  className="px-2.5 py-1 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] disabled:opacity-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Download binary PDF document"
                >
                  <DownloadIcon size={12} />
                  <span>{downloadingId === `${rep.id}-PDF` ? 'Generating...' : 'PDF'}</span>
                </button>
                <button
                  onClick={() => handleDownload(rep, 'XLSX')}
                  disabled={downloadingId === `${rep.id}-XLSX`}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c9d4c6] text-[#14291a] hover:bg-[#edf2ea] disabled:opacity-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Download Microsoft Excel spreadsheet"
                >
                  <DownloadIcon size={12} />
                  <span>{downloadingId === `${rep.id}-XLSX` ? 'Generating...' : 'XLSX'}</span>
                </button>
                <button
                  onClick={() => handleDownload(rep, 'CSV')}
                  disabled={downloadingId === `${rep.id}-CSV`}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-[#c9d4c6] text-[#14291a] hover:bg-[#edf2ea] disabled:opacity-50 transition-colors inline-flex items-center gap-1 cursor-pointer"
                  title="Download standard CSV spreadsheet"
                >
                  <DownloadIcon size={12} />
                  <span>{downloadingId === `${rep.id}-CSV` ? 'Generating...' : 'CSV'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
