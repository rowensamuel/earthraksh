import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { farmService } from '../../services/farmService';
import { cropService } from '../../services/cropService';
import { marketplaceService } from '../../services/marketplaceService';
import { orderService } from '../../services/orderService';
import { inventoryService } from '../../services/inventoryService';
import { User, Farm, Crop, MarketplaceProduct, Order, InventoryItem } from '../../types';
import {
  UsersIcon,
  FarmerIcon,
  BuyerIcon,
  FarmIcon,
  CropIcon,
  MarketplaceIcon,
  OrdersIcon,
  FinanceIcon,
  AlertCircleIcon,
  DownloadIcon,
  RefreshIcon
} from '../../components/common/Icons';
import { showToast } from '../../components/common/Toast';
import { downloadCSV } from '../../utils/fileDownloader';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [u, f, c, p, o, inv] = await Promise.all([
        adminService.getAllUsers(),
        farmService.getFarms(),
        cropService.getCrops(),
        marketplaceService.getAllProductsAdmin(),
        orderService.getOrders(),
        inventoryService.getInventory()
      ]);
      setUsers(u);
      setFarms(f);
      setCrops(c);
      setProducts(p);
      setOrders(o);
      setInventory(inv);
    } catch (err) {
      console.warn('Admin dashboard load error:', err);
    }
  };

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const totalFarmers = users.filter(u => u.role === 'FARMER').length;
  const totalBuyers = users.filter(u => u.role === 'BUYER').length;
  const activeFarms = farms.length;
  const activeCrops = crops.filter(c => c.status === 'Growing' || c.status === 'Planted').length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.payment_status === 'Completed' ? o.total_amount : 0), 0);
  const lowStockAlerts = inventory.filter(i => i.status === 'Low Stock' || i.status === 'Critical');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
    showToast('Telemetry refreshed', 'info', 'Central platform metrics synced from Supabase.');
  };

  const handleExportSummary = () => {
    const headers = [
      'Record Type',
      'Identifier / Name',
      'Category / Role / Spec',
      'Value / Amount (INR)',
      'Status / Date'
    ];

    const rows: (string | number)[][] = [
      ['KPI Metric', 'Total Registered Farmers', 'User Demographics', totalFarmers, 'Active'],
      ['KPI Metric', 'Total Commercial Buyers', 'User Demographics', totalBuyers, 'Active'],
      ['KPI Metric', 'Total Farmland Holdings', 'GIS Cadastral', activeFarms, `${farms.reduce((a, f) => a + f.area, 0)} Total Acres`],
      ['KPI Metric', 'Active Standing Crops', 'Agronomic Yield', activeCrops, 'Healthy Growth Index'],
      ['KPI Metric', 'Platform GMV Fulfillments', 'Direct Exchange', `INR ${totalRevenue.toLocaleString()}`, `${orders.length} Total Orders`],
      ['KPI Metric', 'Agrochemical Buffer Alerts', 'Supply Chain', lowStockAlerts.length, 'Depot Restock Requisite'],
      ...orders.map(o => [
        'Consignment Order',
        o.order_id,
        o.payment_method,
        o.total_amount,
        `${o.order_status} · ${o.order_date}`
      ]),
      ...products.map(p => [
        'Marketplace Produce',
        p.product_name,
        p.category,
        `INR ${p.price_per_unit}/${p.unit}`,
        `${p.status} (${p.available_qty} ${p.unit} remaining)`
      ])
    ];

    const dateStr = new Date().toISOString().split('T')[0];
    downloadCSV(`EarthRakshak_Executive_Audit_${dateStr}`, headers, rows);
    showToast('Platform Audit Exported', 'success', 'Audit CSV compiled and downloaded.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        category="Directorate Administrative Console"
        title="EarthRakshak Central Telemetry & Governance"
        description="Comprehensive real-time administrative oversight across registered farming clusters, verified procurement buyers, marketplace trading volumes, and operational supply chain state."
        actions={
          <>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-3 py-1.5 text-xs font-semibold bg-white border border-[#c9d4c6] hover:bg-[#edf2ea] disabled:opacity-50 text-[#2d4532] flex items-center gap-1.5 transition-colors"
            >
              <RefreshIcon size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <button
              onClick={handleExportSummary}
              className="px-3 py-1.5 text-xs font-semibold bg-[#1b5e20] text-white hover:bg-[#144719] flex items-center gap-1.5 transition-colors"
            >
              <DownloadIcon size={14} />
              <span>Export Audit</span>
            </button>
          </>
        }
      />

      {/* KPI METRIC GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Users"
          value={users.length}
          unit="Registered"
          subtext="Admin, Farmer & Buyer accounts"
          icon={<UsersIcon size={18} />}
        />
        <StatCard
          label="Active Farmers"
          value={totalFarmers}
          unit="Producers"
          subtext="Verified landholding producers"
          icon={<FarmerIcon size={18} />}
        />
        <StatCard
          label="Commercial Buyers"
          value={totalBuyers}
          unit="Procurement"
          subtext="Retailers, wholesalers, exporters"
          icon={<BuyerIcon size={18} />}
        />
        <StatCard
          label="Mapped Farms"
          value={activeFarms}
          unit="Plots"
          subtext={`${farms.reduce((a, f) => a + f.area, 0).toFixed(1)} Total Acres`}
          icon={<FarmIcon size={18} />}
        />
        <StatCard
          label="Active Crops"
          value={activeCrops}
          unit="Cultivations"
          subtext="Planted & Growing stage"
          icon={<CropIcon size={18} />}
        />
        <StatCard
          label="Market Produce"
          value={products.length}
          unit="Listings"
          subtext="Live on agricultural exchange"
          icon={<MarketplaceIcon size={18} />}
        />
        <StatCard
          label="Total Orders"
          value={orders.length}
          unit="Fulfillments"
          subtext={`${orders.filter(o => o.order_status === 'Delivered').length} delivered`}
          icon={<OrdersIcon size={18} />}
        />
        <StatCard
          label="Gross Platform GMV"
          value={`₹${(totalRevenue / 1000).toFixed(1)}k`}
          unit="INR"
          subtext="Settled through UPI & Net Banking"
          icon={<FinanceIcon size={18} />}
        />
      </div>

      {/* OPERATIONAL SPLIT: RECENT ORDERS & INVENTORY ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Overview */}
        <div className="lg:col-span-8 bg-white border border-[#dbe3d8] flex flex-col">
          <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
            <div>
              <h2 className="text-sm font-bold font-display uppercase tracking-wide text-[#14291a]">
                Recent Direct Marketplace Transactions
              </h2>
              <p className="text-[11px] text-[#637966]">Live farm produce procurement and fulfillment status</p>
            </div>
            <a
              href="/admin/marketplace"
              className="text-xs font-semibold text-[#1b5e20] hover:underline"
            >
              View All Marketplace →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f2f5ef] border-b border-[#dbe3d8] text-[#4d5e50]">
                  <th className="px-4 py-2.5 font-semibold">Order ID</th>
                  <th className="px-4 py-2.5 font-semibold">Buyer Organization</th>
                  <th className="px-4 py-2.5 font-semibold">Produce Items</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Amount</th>
                  <th className="px-4 py-2.5 font-semibold">Fulfillment Status</th>
                  <th className="px-4 py-2.5 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf1ea]">
                {orders.slice(0, 5).map(o => (
                  <tr key={o.order_id} className="hover:bg-[#f7f9f6]">
                    <td className="px-4 py-3 font-semibold text-[#14291a]">{o.order_id}</td>
                    <td className="px-4 py-3 text-[#2d4231]">{o.buyer_name}</td>
                    <td className="px-4 py-3 text-[#4c6150]">
                      {o.items.map(i => `${i.quantity} ${i.unit} ${i.product_name}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-[#14291a]">
                      ₹{o.total_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.order_status} />
                    </td>
                    <td className="px-4 py-3 text-[#4c6150]">
                      <span className="font-medium text-[#1b5e20]">{o.payment_method}</span>
                      <span className="text-[11px] text-[#738776] block">{o.payment_status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Inventory Alerts & System Status */}
        <div className="lg:col-span-4 space-y-6">
          {/* Inventory Alerts */}
          <div className="bg-white border border-[#dbe3d8]">
            <div className="p-4 border-b border-[#e2e8df] flex items-center justify-between bg-[#fafbfa]">
              <div className="flex items-center gap-2">
                <AlertCircleIcon size={16} className="text-[#b45309]" />
                <h2 className="text-xs font-bold font-display uppercase tracking-wide text-[#14291a]">
                  Critical Supplies & Inventory
                </h2>
              </div>
              <span className="text-[11px] font-bold text-[#b45309] tabular-nums">
                {lowStockAlerts.length} Attention Required
              </span>
            </div>

            <div className="p-4 space-y-3">
              {lowStockAlerts.length > 0 ? (
                lowStockAlerts.map(item => (
                  <div key={item.item_id} className="p-2.5 bg-[#fbfcfb] border border-[#e4ebe1]">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-[#14291a]">{item.item_name}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#637966] mt-1.5 pt-1.5 border-t border-[#edf2ea]">
                      <span>{item.category}</span>
                      <span className="tabular-nums font-semibold text-[#14291a]">
                        {item.quantity} {item.unit} remaining
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#637966] text-center py-4">All fertilizer and seed stocks are optimal.</p>
              )}
            </div>
          </div>

          {/* System Telemetry & RBAC State */}
          <div className="bg-white border border-[#dbe3d8] p-4">
            <h2 className="text-xs font-bold font-display uppercase tracking-wider text-[#14291a] mb-3">
              System Infrastructure & Policy
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#edf1ea]">
                <span className="text-[#5f7563]">PostgreSQL RLS Mode</span>
                <span className="font-semibold text-[#1b5e20]">Enforced (16 Tables)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#edf1ea]">
                <span className="text-[#5f7563]">Storage Buckets</span>
                <span className="font-medium text-[#1c2e22]">produce-photos, equipment</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#edf1ea]">
                <span className="text-[#5f7563]">Active Cluster Region</span>
                <span className="font-medium text-[#1c2e22]">ap-south-1 (Mumbai)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#5f7563]">Role Isolation</span>
                <span className="font-semibold text-[#1b5e20]">Admin / Farmer / Buyer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
