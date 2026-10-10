import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { inventoryService } from '../../services/inventoryService';
import { InventoryItem } from '../../types';
import { AlertCircleIcon } from '../../components/common/Icons';

export const GlobalInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const data = await inventoryService.getInventory();
      setItems(data);
    } catch (err) {
      console.warn('Global inventory fetch error:', err);
    }
  };

  const filteredItems = categoryFilter === 'ALL'
    ? items
    : items.filter(i => i.category === categoryFilter);

  const lowStockCount = items.filter(i => i.status === 'Low Stock' || i.status === 'Critical').length;

  const columns: Column<InventoryItem>[] = [
    {
      header: 'Item Code',
      accessorKey: 'item_id',
      sortable: true,
      cell: row => <span className="font-semibold text-[#14291a]">{row.item_id}</span>
    },
    {
      header: 'Material / Chemical Name',
      accessorKey: 'item_name',
      sortable: true,
      cell: row => (
        <div>
          <span className="font-bold text-[#14291a] block">{row.item_name}</span>
          {row.expiry_date && (
            <span className="text-[11px] text-[#6b7e6e] tabular-nums">Expires: {row.expiry_date}</span>
          )}
        </div>
      )
    },
    {
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      cell: row => <span className="text-xs font-medium text-[#2d4532]">{row.category}</span>
    },
    {
      header: 'Current Stock Level',
      accessorKey: 'quantity',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="font-bold tabular-nums text-xs text-[#14291a]">
          {row.quantity} {row.unit}
        </span>
      )
    },
    {
      header: 'Unit Cost Benchmark',
      accessorKey: 'unit_price',
      sortable: true,
      align: 'right',
      cell: row => (
        <span className="tabular-nums text-xs text-[#1c2e22]">
          ₹{row.unit_price} / {row.unit}
        </span>
      )
    },
    {
      header: 'Manufacturer / Supplier',
      accessorKey: 'supplier',
      cell: row => <span className="text-xs text-[#455c48]">{row.supplier}</span>
    },
    {
      header: 'Threshold Status',
      accessorKey: 'status',
      sortable: true,
      cell: row => <StatusBadge status={row.status} />
    }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        category="Agrochemical & Seed Telemetry"
        title="Global Farm Inventory & Input Supplies"
        description="Unified tracking of certified seeds, slow-release fertilizers, biological crop protection chemicals, and drip irrigation equipment across regional warehouses."
      />

      {/* Inventory Health Banner */}
      {lowStockCount > 0 && (
        <div className="p-3 bg-[#fffbeb] border border-[#fef3c7] flex items-center justify-between text-xs text-[#92400e]">
          <div className="flex items-center gap-2">
            <AlertCircleIcon size={16} className="text-[#d97706]" />
            <span>
              <strong>Supply Alert:</strong> {lowStockCount} input categories are currently below safety buffer thresholds.
            </span>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider">Replenishment Priority</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-white border border-[#dbe3d8] w-fit">
        {(['ALL', 'Seed', 'Fertilizer', 'Pesticide', 'Equipment'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              categoryFilter === cat
                ? 'bg-[#1b5e20] text-white font-bold'
                : 'text-[#506352] hover:text-[#14291a]'
            }`}
          >
            {cat === 'ALL' ? 'All Supplies' : `${cat}s`}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredItems}
        searchPlaceholder="Search supplies by name, supplier, or SKU..."
        rowsPerPage={10}
      />
    </div>
  );
};
